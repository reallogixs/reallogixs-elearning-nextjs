import type { Certificate, Course, Meeting, Order, Registrant } from "@/types/domain";
import type { Result } from "@/types/forms";
import { formatClassTime, formatDate } from "@/lib/domain/format";
import { newCertificateCode, newId } from "@/lib/domain/ids";
import {
  ADMISSION_MESSAGE,
  admit,
  closeSessions,
  eligibleOrders,
  isInMeeting,
} from "@/lib/domain/meeting";
import { SITE } from "@/lib/seo";
import { registrantEmailSchema } from "@/lib/validation/admin";
import { validateWith } from "@/lib/validation/validate";
import * as zoom from "@/lib/zoom/client";

import { fail, latency, nowIso, ok, read, write } from "./client";
import { sendEmail } from "./mailer";

function find(courseId: string): Meeting | undefined {
  return read().meetings.find((meeting) => meeting.courseId === courseId);
}

function update(courseId: string, change: (meeting: Meeting) => Meeting): void {
  write((db) => ({
    ...db,
    meetings: db.meetings.map((meeting) =>
      meeting.courseId === courseId ? change(meeting) : meeting,
    ),
  }));
}

function emailInvite(course: Course, registrant: Registrant): void {
  sendEmail(
    "zoom_invite",
    registrant.email,
    `Your Zoom link for ${course.title}`,
    `Hi ${registrant.name},\n\nYou're registered for ${course.title}.\n\n${formatDate(course.startsAt)}, ${formatClassTime(course.startsAt, course.durationMinutes)}\n\nYour personal link: ${SITE.url}/join/${registrant.joinToken}\n\nSign in to Zoom with ${registrant.email} before joining. Other accounts are turned away, so please don't share this link. To earn your certificate, join the class while it is running.\n\n— Reallogixs Academy`,
  );
}

/** Registers a confirmed student on the class's Zoom meeting and emails their personal link. */
export async function registerStudent(order: Order, course: Course): Promise<Result> {
  const meeting = find(course.id);
  if (!meeting) return fail("This course has no Zoom meeting.");
  if (meeting.status === "ended")
    return fail(
      "This class has already ended, so the student can't join. Cancel the order and refund them.",
    );
  const { name, email } = order.contact;
  if (meeting.registrants.some((existing) => existing.email === email))
    return fail("This email is already registered for this class under another order.");
  const { joinToken } = await zoom.addRegistrant(meeting.zoomId, { name, email });
  const registrant = { orderId: order.id, name, email, joinToken, registeredAt: nowIso() };
  update(course.id, (current) => ({
    ...current,
    registrants: [...current.registrants, registrant],
  }));
  emailInvite(course, registrant);
  return ok(undefined);
}

/** Takes a student off the meeting; their link stops working and they leave if inside. */
export async function unregisterStudent(order: Order): Promise<void> {
  const meeting = find(order.courseId);
  const registrant = meeting?.registrants.find((candidate) => candidate.orderId === order.id);
  if (!meeting || !registrant) return;
  await zoom.removeRegistrant(meeting.zoomId, registrant.email);
  update(order.courseId, (current) => ({
    ...closeSessions(current, nowIso(), order.id),
    registrants: current.registrants.filter((candidate) => candidate.orderId !== order.id),
  }));
}

/** For a student whose Zoom account uses a different email: new link, old one stops working. */
export async function changeRegistrantEmail(
  courseId: string,
  orderId: string,
  input: { email: string },
): Promise<Result> {
  await latency();
  const checked = await validateWith(registrantEmailSchema, input);
  if (!checked.ok) return checked;
  const email = checked.data.email.toLowerCase();
  const meeting = find(courseId);
  const course = read().courses.find((candidate) => candidate.id === courseId);
  const registrant = meeting?.registrants.find((candidate) => candidate.orderId === orderId);
  if (!meeting || !course || !registrant) return fail("Registrant not found.");
  if (meeting.status === "ended") return fail("This class has already ended.");
  if (meeting.registrants.some((other) => other.orderId !== orderId && other.email === email))
    return fail("Another student is registered with this email.");
  await zoom.removeRegistrant(meeting.zoomId, registrant.email);
  const { joinToken } = await zoom.addRegistrant(meeting.zoomId, { name: registrant.name, email });
  const updated: Registrant = { ...registrant, email, joinToken, registeredAt: nowIso() };
  update(courseId, (current) => ({
    ...closeSessions(current, nowIso(), orderId),
    registrants: current.registrants.map((candidate) =>
      candidate.orderId === orderId ? updated : candidate,
    ),
  }));
  emailInvite(course, updated);
  return ok(undefined);
}

export async function resendInvite(courseId: string, orderId: string): Promise<Result> {
  await latency();
  const course = read().courses.find((candidate) => candidate.id === courseId);
  const registrant = find(courseId)?.registrants.find((candidate) => candidate.orderId === orderId);
  if (!course || !registrant) return fail("Registrant not found.");
  emailInvite(course, registrant);
  return ok(undefined);
}

/* Host ------------------------------------------------------------------- */

/** MOCK of Zoom's meeting.started webhook. Enrolment closes once the class is running. */
export async function startMeeting(courseId: string): Promise<Result> {
  await latency();
  if (find(courseId)?.status !== "scheduled") return fail("This class has already been started.");
  update(courseId, (current) => ({ ...current, status: "live", startedAt: nowIso() }));
  write((db) => ({
    ...db,
    courses: db.courses.map((course) =>
      course.id === courseId ? { ...course, enrolmentOpen: false } : course,
    ),
  }));
  return ok(undefined);
}

/** MOCK of Zoom's meeting.ended webhook. */
export async function endMeeting(courseId: string): Promise<Result> {
  await latency();
  if (find(courseId)?.status !== "live") return fail("This class isn't running.");
  const at = nowIso();
  update(courseId, (current) => ({ ...closeSessions(current, at), status: "ended", endedAt: at }));
  return ok(undefined);
}

/* Students --------------------------------------------------------------- */

/** The door: admits or turns away, and records either one. */
export async function joinMeeting(token: string, email: string): Promise<Result> {
  await latency();
  const db = read();
  const meeting = db.meetings.find((candidate) =>
    candidate.registrants.some((registrant) => registrant.joinToken === token),
  );
  const admission = admit(meeting, db.orders, token, email);
  if (!admission.allowed) {
    // Arriving early or late with a valid account isn't a refusal worth flagging to the host.
    if (meeting && (admission.reason === "wrong_email" || admission.reason === "not_paid")) {
      const entry = { at: nowIso(), email, reason: ADMISSION_MESSAGE[admission.reason] };
      update(meeting.courseId, (current) => ({ ...current, denied: [entry, ...current.denied] }));
    }
    return fail(ADMISSION_MESSAGE[admission.reason]);
  }
  const { orderId } = admission.registrant;
  if (meeting && !isInMeeting(meeting, orderId)) {
    update(meeting.courseId, (current) => ({
      ...current,
      attendance: [...current.attendance, { orderId, joinedAt: nowIso(), leftAt: null }],
    }));
  }
  return ok(undefined);
}

export async function leaveMeeting(token: string): Promise<Result> {
  await latency(150);
  const meeting = read().meetings.find((candidate) =>
    candidate.registrants.some((registrant) => registrant.joinToken === token),
  );
  const registrant = meeting?.registrants.find((candidate) => candidate.joinToken === token);
  if (!meeting || !registrant) return fail(ADMISSION_MESSAGE.invalid_link);
  update(meeting.courseId, (current) => closeSessions(current, nowIso(), registrant.orderId));
  return ok(undefined);
}

/* Completion and certificates -------------------------------------------- */

function emailCertificate(certificate: Certificate, email: string): void {
  const href = `/certificates/${certificate.code}`;
  sendEmail(
    "certificate_issued",
    email,
    `Your certificate: ${certificate.courseTitle}`,
    `Hi ${certificate.studentName},\n\nThanks for joining ${certificate.courseTitle}. Your e-certificate is attached.\n\nView it: ${SITE.url}${href}\nAnyone can check it at ${SITE.url}/verify with the code ${certificate.code}.\n\n— Reallogixs Academy`,
    [{ name: `${certificate.code}.pdf`, href }],
  );
}

/**
 * Marks the class completed, then creates and emails a certificate to everyone who paid
 * and was in the meeting after it started. Ends the meeting first if it is still running.
 */
export async function completeClass(courseId: string): Promise<Result<{ issued: number }>> {
  await latency();
  const meeting = find(courseId);
  const course = read().courses.find((candidate) => candidate.id === courseId);
  if (!meeting || !course) return fail("Class not found.");
  if (meeting.completedAt) return fail("This class is already completed.");
  if (!meeting.startedAt) return fail("The class hasn't been held yet. Start it first.");

  const at = nowIso();
  update(courseId, (current) => ({
    ...closeSessions(current, at),
    status: "ended",
    endedAt: current.endedAt ?? at,
    completedAt: at,
  }));
  const db = read();
  const closed = find(courseId) ?? meeting;
  const have = new Set(db.certificates.map((certificate) => certificate.orderId));
  const orders = eligibleOrders(closed, db.orders).filter((order) => !have.has(order.id));
  const certificates = orders.map((order): Certificate => ({
    id: newId("crt"),
    code: newCertificateCode(),
    orderId: order.id,
    courseId,
    studentName: order.contact.name,
    courseTitle: course.title,
    issuedAt: at,
    revokedAt: null,
  }));
  write((current) => ({ ...current, certificates: [...certificates, ...current.certificates] }));
  certificates.forEach((certificate, index) => {
    const order = orders[index];
    if (order) emailCertificate(certificate, order.contact.email);
  });
  return ok({ issued: certificates.length });
}

export async function resendCertificate(id: string): Promise<Result> {
  await latency();
  const db = read();
  const certificate = db.certificates.find((candidate) => candidate.id === id);
  const order = db.orders.find((candidate) => candidate.id === certificate?.orderId);
  if (!certificate || !order) return fail("Certificate not found.");
  if (certificate.revokedAt) return fail("This certificate has been revoked.");
  emailCertificate(certificate, order.contact.email);
  return ok(undefined);
}

/** Revoked certificates stay on record so verification can say they're no longer valid. */
export async function setCertificateRevoked(id: string, revoked: boolean): Promise<Result> {
  await latency();
  write((db) => ({
    ...db,
    certificates: db.certificates.map((certificate) =>
      certificate.id === id
        ? { ...certificate, revokedAt: revoked ? nowIso() : null }
        : certificate,
    ),
  }));
  return ok(undefined);
}

/** Public lookup used by the verification page. */
export async function verifyCertificate(code: string): Promise<Result<Certificate>> {
  await latency();
  const certificate = read().certificates.find(
    (candidate) => candidate.code === code.trim().toUpperCase(),
  );
  return certificate
    ? ok(certificate)
    : fail("No certificate matches this code. Check it and try again.");
}

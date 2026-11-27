import "server-only";

import { newCertificateCode } from "@/lib/domain/ids";
import { siteUrl } from "@/server/core/env";
import { db, type Tx } from "@/server/db";
import type { EmailContent } from "@/server/email/layout";
import { enqueueEmails } from "@/server/email/queue";
import { sendMail } from "@/server/email/send";
import { certificateIssued } from "@/server/email/templates";
import { certificatePdf } from "@/server/files/certificatePdf";

/**
 * One certificate for each student who paid, is registered, and was in the class after it
 * started. There is no minimum stay. Returns the new certificates' ids.
 */
export async function issueCertificates(
  tx: Tx,
  meeting: { id: string; courseId: string; startedAt: Date },
  courseTitle: string,
): Promise<string[]> {
  const orders = await tx.order.findMany({
    where: {
      courseId: meeting.courseId,
      status: "confirmed",
      certificate: null,
      AND: [
        { registrant: { some: { meetingId: meeting.id, revokedAt: null } } },
        {
          registrant: {
            some: {
              meetingId: meeting.id,
              attendance: { some: { leftAt: { gt: meeting.startedAt } } },
            },
          },
        },
      ],
    },
    select: { id: true, contactName: true },
  });
  const created = await tx.certificate.createManyAndReturn({
    data: orders.map((order) => ({
      code: newCertificateCode(),
      orderId: order.id,
      studentName: order.contactName,
      courseTitle,
    })),
    select: { id: true },
  });
  return created.map(({ id }) => id);
}

/** The certificate email with its PDF, or null if it shouldn't go out (missing or revoked). */
export async function buildCertificateEmail(
  id: string,
): Promise<{ to: string; content: EmailContent } | null> {
  const found = await db().certificate.findUnique({
    where: { id },
    include: { order: { select: { contactEmail: true } } },
  });
  if (!found || found.revokedAt) return null;
  const { order, ...certificate } = found;
  const email = certificateIssued(certificate.studentName, {
    course: certificate.courseTitle,
    code: certificate.code,
    url: siteUrl(`/certificates/${certificate.code}`),
    verifyUrl: siteUrl("/verify"),
  });
  const pdf = await certificatePdf({
    ...certificate,
    issuedAt: certificate.issuedAt.toISOString(),
  });
  const filename = `${certificate.code}.pdf`;
  return {
    to: order.contactEmail,
    content: pdf
      ? { ...email, attachments: [{ filename, content: pdf, contentType: "application/pdf" }] }
      : email,
  };
}

/** One certificate, sent now (an admin's resend). Returns whether it was sent. */
export async function sendCertificate(id: string): Promise<boolean> {
  const email = await buildCertificateEmail(id);
  return email ? sendMail(email.to, email.content, id) : false;
}

/** A class's certificates join the email queue in the same transaction that creates them. */
export async function queueCertificates(tx: Tx, ids: string[]): Promise<void> {
  const certificates = await tx.certificate.findMany({
    where: { id: { in: ids } },
    select: { id: true, courseTitle: true, order: { select: { contactEmail: true } } },
  });
  await enqueueEmails(
    tx,
    certificates.map((certificate) => ({
      template: "certificate_issued",
      entityId: certificate.id,
      to: certificate.order.contactEmail,
      subject: `Your certificate: ${certificate.courseTitle}`,
    })),
  );
}

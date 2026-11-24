import type { Meeting, Order, Registrant } from "@/types/domain";

/** Why someone can't enter, or the registrant who can. The single door policy for a class. */
export type Admission =
  | { allowed: true; registrant: Registrant }
  | {
      allowed: false;
      reason: "invalid_link" | "not_paid" | "wrong_email" | "not_started" | "ended";
    };

export const ADMISSION_MESSAGE: Record<Extract<Admission, { allowed: false }>["reason"], string> = {
  invalid_link: "This join link isn't valid. Use the latest link from your email or order page.",
  not_paid: "This link belongs to an enrolment that isn't paid and confirmed.",
  wrong_email:
    "That Zoom account isn't registered for this class. Sign in with your invited email.",
  not_started: "The host hasn't started the class yet.",
  ended: "This class has ended.",
};

/**
 * Only a registered student, with a confirmed order, signed in with the registered
 * email, while the host has the meeting running.
 */
export function admit(
  meeting: Meeting | undefined,
  orders: Order[],
  token: string,
  email: string,
): Admission {
  const registrant = meeting?.registrants.find((candidate) => candidate.joinToken === token);
  if (!meeting || !registrant) return { allowed: false, reason: "invalid_link" };
  const order = orders.find((candidate) => candidate.id === registrant.orderId);
  if (order?.status !== "confirmed") return { allowed: false, reason: "not_paid" };
  if (registrant.email.toLowerCase() !== email.trim().toLowerCase())
    return { allowed: false, reason: "wrong_email" };
  if (meeting.status === "ended") return { allowed: false, reason: "ended" };
  if (meeting.status === "scheduled") return { allowed: false, reason: "not_started" };
  return { allowed: true, registrant };
}

/** True if the student was in the meeting at any moment after the host started it. */
export function attended(meeting: Meeting, orderId: string): boolean {
  const { startedAt } = meeting;
  if (!startedAt) return false;
  return meeting.attendance.some(
    (session) =>
      session.orderId === orderId && (session.leftAt === null || session.leftAt > startedAt),
  );
}

export function isInMeeting(meeting: Meeting, orderId: string): boolean {
  return meeting.attendance.some(
    (session) => session.orderId === orderId && session.leftAt === null,
  );
}

/** Confirmed orders that earn a certificate: paid, registered and attended. */
export function eligibleOrders(meeting: Meeting, orders: Order[]): Order[] {
  const registered = new Set(meeting.registrants.map((registrant) => registrant.orderId));
  return orders.filter(
    (order) =>
      order.courseId === meeting.courseId &&
      order.status === "confirmed" &&
      registered.has(order.id) &&
      attended(meeting, order.id),
  );
}

/** Closes every open stay, e.g. when the host ends the meeting. */
export function closeSessions(meeting: Meeting, at: string, orderId?: string): Meeting {
  return {
    ...meeting,
    attendance: meeting.attendance.map((session) =>
      session.leftAt === null && (!orderId || session.orderId === orderId)
        ? { ...session, leftAt: at }
        : session,
    ),
  };
}

export function emptyMeeting(courseId: string, zoomId: string): Meeting {
  return {
    courseId,
    zoomId,
    status: "scheduled",
    startedAt: null,
    endedAt: null,
    completedAt: null,
    registrants: [],
    attendance: [],
    denied: [],
  };
}

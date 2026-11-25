import type { Meeting, MeetingStatus, Order, OrderStatus } from "@/types/domain";

/** Why someone can't enter. The single door policy for a class. */
export type Refusal = "invalid_link" | "not_paid" | "wrong_email" | "not_started" | "ended";

export const ADMISSION_MESSAGE: Record<Refusal, string> = {
  invalid_link: "This join link isn't valid. Use the latest link from your email or order page.",
  not_paid: "This link belongs to an enrolment that isn't paid and confirmed.",
  wrong_email:
    "That Zoom account isn't registered for this class. Sign in with your invited email.",
  not_started: "The host hasn't started the class yet.",
  ended: "This class has ended.",
};

/**
 * Only a registered student, with a confirmed order, signed in with the registered email, while
 * the host has the meeting running. Null means they can come in.
 */
export function refusal(
  registrant: { email: string; orderStatus: OrderStatus; meetingStatus: MeetingStatus },
  email: string,
): Refusal | null {
  if (registrant.orderStatus !== "confirmed") return "not_paid";
  if (registrant.email !== email.trim().toLowerCase()) return "wrong_email";
  if (registrant.meetingStatus === "ended") return "ended";
  return registrant.meetingStatus === "scheduled" ? "not_started" : null;
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

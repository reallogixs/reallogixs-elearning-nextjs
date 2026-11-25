import type { Course, Order, OrderStatus } from "@/types/domain";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting verification",
  rejected: "Receipt rejected",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

/** Seats count once the admin confirms the payment. */
export function seatsTaken(orders: Order[], courseId: string): number {
  return orders.filter((order) => order.courseId === courseId && order.status === "confirmed")
    .length;
}

export type EnrolmentState = "open" | "full" | "closed" | "started";

/** Whether a course takes enrolments, given the seats it has left. */
export function enrolmentWith(
  course: Pick<Course, "enrolmentOpen" | "startsAt">,
  left: number,
  now = new Date(),
): EnrolmentState {
  if (!course.enrolmentOpen) return "closed";
  if (left === 0) return "full";
  return new Date(course.startsAt) < now ? "started" : "open";
}

export const ENROLMENT_LABEL: Record<EnrolmentState, string> = {
  open: "Enrolling now",
  full: "Class full",
  closed: "Enrolment closed",
  started: "Class started",
};

export function latestReceipt(order: Order): Order["receipts"][number] | undefined {
  return order.receipts.at(-1);
}

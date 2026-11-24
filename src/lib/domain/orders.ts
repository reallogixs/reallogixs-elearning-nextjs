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

export function seatsLeft(course: Course, orders: Order[]): number {
  return Math.max(0, course.seats - seatsTaken(orders, course.id));
}

export type EnrolmentState = "open" | "full" | "closed" | "started";

export function enrolmentState(course: Course, orders: Order[], now = new Date()): EnrolmentState {
  if (!course.enrolmentOpen) return "closed";
  if (seatsLeft(course, orders) === 0) return "full";
  if (new Date(course.startsAt) < now) return "started";
  return "open";
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

import type { CatalogueCourse } from "@/types/catalogue";
import type { Certificate, Meeting, Order, StudentUser, TeacherUser } from "@/types/domain";
import type { PortalData } from "@/types/portal";

/** Pure read helpers over the data the server loaded for this viewer. */

export function meetingFor(db: PortalData, courseId: string): Meeting | undefined {
  return db.meetings.find((meeting) => meeting.courseId === courseId);
}

export function certificateForOrder(db: PortalData, orderId: string): Certificate | undefined {
  return db.certificates.find((certificate) => certificate.orderId === orderId);
}

export function courseById(db: PortalData, id: string): CatalogueCourse | undefined {
  return db.courses.find((course) => course.id === id);
}

export function paymentMethodById(
  db: PortalData,
  id: string,
): PortalData["paymentMethods"][number] | undefined {
  return db.paymentMethods.find((method) => method.id === id);
}

export function teachers(db: PortalData): TeacherUser[] {
  return db.users.filter((user): user is TeacherUser => user.role === "teacher");
}

export function students(db: PortalData): StudentUser[] {
  return db.users.filter((user): user is StudentUser => user.role === "student");
}

export function ordersForTeacher(db: PortalData, teacherId: string): Order[] {
  return db.orders.filter((order) => order.commission?.teacherId === teacherId);
}

export function ordersForStudent(db: PortalData, student: StudentUser): Order[] {
  return db.orders.filter((order) => order.studentId === student.id);
}

/** Confirmed, unpaid commissions for a teacher. */
export function unpaidCommissions(orders: Order[], teacherId: string): Order[] {
  return orders.filter(
    (order) =>
      order.status === "confirmed" &&
      order.commission?.teacherId === teacherId &&
      !order.commission.payoutId,
  );
}

export function byNewest<T extends { createdAt: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export interface TeacherSummary {
  referrals: number;
  confirmed: number;
  pending: number;
  earned: number;
  paid: number;
  due: number;
}

/** Totals for the teacher portal and the admin payouts screen. */
export function teacherSummary(db: PortalData, teacherId: string): TeacherSummary {
  const orders = ordersForTeacher(db, teacherId).filter((order) => order.status !== "cancelled");
  const confirmed = orders.filter((order) => order.status === "confirmed");
  const earned = confirmed.reduce((sum, order) => sum + (order.commission?.amount ?? 0), 0);
  const paid = confirmed
    .filter((order) => order.commission?.payoutId)
    .reduce((sum, order) => sum + (order.commission?.amount ?? 0), 0);
  return {
    referrals: orders.length,
    confirmed: confirmed.length,
    pending: orders.filter((order) => order.status === "pending").length,
    earned,
    paid,
    due: earned - paid,
  };
}

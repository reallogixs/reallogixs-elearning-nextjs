import type { Course, Database, Order, StudentUser, TeacherUser } from "@/types/domain";
import { normalisePhone } from "@/lib/domain/format";

/** Pure read helpers over the database snapshot. Supabase queries replace these later. */

export function publishedCourses(db: Database): Course[] {
  return db.courses.filter((course) => course.status === "published");
}

export function courseBySlug(db: Database, slug: string): Course | undefined {
  return db.courses.find((course) => course.slug === slug);
}

export function courseById(db: Database, id: string): Course | undefined {
  return db.courses.find((course) => course.id === id);
}

export function instructorById(
  db: Database,
  id: string,
): Database["instructors"][number] | undefined {
  return db.instructors.find((instructor) => instructor.id === id);
}

export function categoryById(db: Database, id: string): Database["categories"][number] | undefined {
  return db.categories.find((category) => category.id === id);
}

export function paymentMethodById(
  db: Database,
  id: string,
): Database["paymentMethods"][number] | undefined {
  return db.paymentMethods.find((method) => method.id === id);
}

export function enabledPaymentMethods(db: Database): Database["paymentMethods"] {
  return db.paymentMethods.filter((method) => method.enabled).sort((a, b) => a.order - b.order);
}

export function teachers(db: Database): TeacherUser[] {
  return db.users.filter((user): user is TeacherUser => user.role === "teacher");
}

export function students(db: Database): StudentUser[] {
  return db.users.filter((user): user is StudentUser => user.role === "student");
}

export function ordersForTeacher(db: Database, teacherId: string): Order[] {
  return db.orders.filter((order) => order.commission?.teacherId === teacherId);
}

/** A student's orders: linked to the account, or placed as a guest with their email/phone. */
export function ordersForStudent(db: Database, student: StudentUser): Order[] {
  const phone = normalisePhone(student.phone);
  return db.orders.filter(
    (order) =>
      order.studentId === student.id ||
      (order.studentId === null &&
        (order.contact.email === student.email || normalisePhone(order.contact.phone) === phone)),
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
export function teacherSummary(db: Database, teacherId: string): TeacherSummary {
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

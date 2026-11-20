import type { Order, Payout, TeacherUser } from "@/types/domain";
import type { Result } from "@/types/forms";
import { formatPKR } from "@/lib/domain/format";
import { newId, newPromoCode, newTempPassword } from "@/lib/domain/ids";
import { teacherSchema, type TeacherFormValues } from "@/lib/validation/admin";
import { validateWith } from "@/lib/validation/validate";

import { fail, latency, nowIso, ok, read, replaceById, write } from "./client";
import { sendEmail } from "./mailer";

function welcomeBody(teacher: TeacherUser, password: string): string {
  return [
    `Hi ${teacher.name},`,
    "",
    "Welcome to the Reallogixs Academy teacher programme. Your portal is ready.",
    "",
    `Login email: ${teacher.email}`,
    `Temporary password: ${password}`,
    `Your promo code: ${teacher.promoCode}`,
    "",
    `Share your code with students. You earn ${teacher.commissionPct}% of every confirmed enrolment${
      teacher.discountPct ? `, and your students save ${teacher.discountPct}%` : ""
    }.`,
    "Please change your password after your first login.",
    "",
    "— Reallogixs Academy",
  ].join("\n");
}

function codeTaken(code: string, exceptId?: string): boolean {
  return read().users.some(
    (user) => user.role === "teacher" && user.promoCode === code && user.id !== exceptId,
  );
}

function uniqueCode(name: string): string {
  let code = newPromoCode(name);
  while (codeTaken(code)) code = newPromoCode(name);
  return code;
}

/** Only admins create teachers. The welcome email carries the password and promo code. */
export async function createTeacher(input: TeacherFormValues): Promise<Result<TeacherUser>> {
  await latency();
  const checked = await validateWith(teacherSchema, input);
  if (!checked.ok) return checked;
  const values = checked.data;
  const email = values.email.toLowerCase();
  if (read().users.some((user) => user.email === email))
    return fail("Someone already uses this email.");
  if (values.promoCode && codeTaken(values.promoCode))
    return fail("Another teacher already has this code.");
  const password = newTempPassword();
  const teacher: TeacherUser = {
    id: newId("usr"),
    role: "teacher",
    name: values.name,
    email,
    phone: values.phone,
    password,
    promoCode: values.promoCode || uniqueCode(values.name),
    commissionPct: values.commissionPct,
    discountPct: values.discountPct,
    active: true,
    createdAt: nowIso(),
  };
  write((db) => ({ ...db, users: [...db.users, teacher] }));
  sendEmail(
    "teacher_welcome",
    teacher.email,
    "Your Reallogixs Academy teacher account",
    welcomeBody(teacher, password),
  );
  return ok(teacher);
}

/** New % values apply to future sales only; past commissions keep their snapshot. */
export async function updateTeacher(id: string, input: TeacherFormValues): Promise<Result> {
  await latency();
  const checked = await validateWith(teacherSchema, input);
  if (!checked.ok) return checked;
  const values = checked.data;
  const email = values.email.toLowerCase();
  if (read().users.some((user) => user.email === email && user.id !== id))
    return fail("Someone already uses this email.");
  if (values.promoCode && codeTaken(values.promoCode, id))
    return fail("Another teacher already has this code.");
  write((db) => ({
    ...db,
    users: replaceById(db.users, id, (user) =>
      user.role === "teacher"
        ? { ...user, ...values, email, promoCode: values.promoCode || user.promoCode }
        : user,
    ),
  }));
  return ok(undefined);
}

export async function setTeacherActive(id: string, active: boolean): Promise<Result> {
  await latency(150);
  write((db) => ({
    ...db,
    users: replaceById(db.users, id, (user) =>
      user.role === "teacher" ? { ...user, active } : user,
    ),
  }));
  return ok(undefined);
}

export async function resetTeacherPassword(id: string): Promise<Result> {
  await latency();
  const teacher = read().users.find(
    (user): user is TeacherUser => user.id === id && user.role === "teacher",
  );
  if (!teacher) return fail("Teacher not found.");
  const password = newTempPassword();
  write((db) => ({ ...db, users: replaceById(db.users, id, (user) => ({ ...user, password })) }));
  sendEmail(
    "teacher_welcome",
    teacher.email,
    "Your new Reallogixs Academy password",
    welcomeBody(teacher, password),
  );
  return ok(undefined);
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

/** Records a payout covering every unpaid commission the teacher has earned so far. */
export async function payTeacher(teacherId: string, reference: string): Promise<Result<Payout>> {
  await latency();
  const db = read();
  const due = unpaidCommissions(db.orders, teacherId);
  if (due.length === 0) return fail("Nothing is due for this teacher.");
  const payout: Payout = {
    id: newId("pay"),
    teacherId,
    amount: due.reduce((sum, order) => sum + (order.commission?.amount ?? 0), 0),
    orderIds: due.map((order) => order.id),
    reference: reference.trim(),
    paidAt: nowIso(),
  };
  const dueIds = new Set(payout.orderIds);
  write((current) => ({
    ...current,
    payouts: [payout, ...current.payouts],
    orders: current.orders.map((order) =>
      dueIds.has(order.id) && order.commission
        ? { ...order, commission: { ...order.commission, payoutId: payout.id } }
        : order,
    ),
  }));
  const teacher = db.users.find((user) => user.id === teacherId);
  if (teacher) {
    sendEmail(
      "payout_sent",
      teacher.email,
      "Commission paid",
      `Hi ${teacher.name},\n\nWe've paid ${formatPKR(payout.amount)} for ${due.length} referral(s). Reference: ${payout.reference}.\n\n— Reallogixs Academy`,
    );
  }
  return ok(payout);
}

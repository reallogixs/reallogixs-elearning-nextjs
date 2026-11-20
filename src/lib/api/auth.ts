import type { StudentUser, User } from "@/types/domain";
import type { Result } from "@/types/forms";
import { normalisePhone } from "@/lib/domain/format";
import { newId } from "@/lib/domain/ids";
import { sessionStore } from "@/lib/store/db";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { validateWith } from "@/lib/validation/validate";

import { fail, latency, nowIso, ok, read, replaceById, write } from "./client";
import { sendEmail } from "./mailer";

function sameEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function login(email: string, password: string): Promise<Result<User>> {
  await latency();
  const user = read().users.find((candidate) => sameEmail(candidate.email, email));
  if (!user || user.password !== password) return fail("That email and password don't match.");
  if (user.role === "teacher" && !user.active)
    return fail("This teacher account is paused. Contact the admin.");
  sessionStore.set(() => ({ userId: user.id, role: user.role }));
  return ok(user);
}

/** Demo-only shortcut used by the role switcher. */
export function loginAs(userId: string): void {
  const user = read().users.find((candidate) => candidate.id === userId);
  if (user) sessionStore.set(() => ({ userId: user.id, role: user.role }));
}

export function logout(): void {
  sessionStore.set(() => null);
}

export async function signupStudent(raw: SignupInput): Promise<Result<StudentUser>> {
  await latency();
  const checked = await validateWith(signupSchema, raw);
  if (!checked.ok) return checked;
  const input = checked.data;
  const db = read();
  if (db.users.some((user) => sameEmail(user.email, input.email))) {
    return fail("An account with this email already exists. Try logging in.");
  }
  const student: StudentUser = {
    id: newId("usr"),
    role: "student",
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password: input.password,
    createdAt: nowIso(),
  };
  const phone = normalisePhone(student.phone);
  write((current) => ({
    ...current,
    users: [...current.users, student],
    // Guest orders placed with the same email or phone move into the new account.
    orders: current.orders.map((order) =>
      order.studentId === null &&
      (sameEmail(order.contact.email, student.email) ||
        normalisePhone(order.contact.phone) === phone)
        ? { ...order, studentId: student.id }
        : order,
    ),
  }));
  sessionStore.set(() => ({ userId: student.id, role: "student" }));
  sendEmail(
    "student_welcome",
    student.email,
    "Welcome to Reallogixs Academy",
    `Hi ${student.name},\n\nYour student account is ready. Any earlier enrolments made with this email or phone are now in your portal.\n\n— Reallogixs Academy`,
  );
  return ok(student);
}

export async function changePassword(
  userId: string,
  current: string,
  next: string,
): Promise<Result> {
  await latency();
  const user = read().users.find((candidate) => candidate.id === userId);
  if (!user) return fail("Account not found.");
  if (user.password !== current) return fail("Your current password is incorrect.");
  write((db) => ({
    ...db,
    users: replaceById(db.users, userId, (u) => ({ ...u, password: next })),
  }));
  sendEmail(
    "password_changed",
    user.email,
    "Your password was changed",
    `Hi ${user.name},\n\nYour Reallogixs Academy password was just changed. If this wasn't you, contact us right away.`,
  );
  return ok(undefined);
}

export async function updateProfile(
  userId: string,
  profile: { name: string; phone: string },
): Promise<Result> {
  await latency();
  write((db) => ({
    ...db,
    users: replaceById(db.users, userId, (user) => ({
      ...user,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
    })),
  }));
  return ok(undefined);
}

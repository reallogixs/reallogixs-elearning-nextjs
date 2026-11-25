"use server";

import { after } from "next/server";

import type { Role } from "@/types/domain";
import { LOGIN_PATH } from "@/lib/account/loginPath";
import {
  changePasswordSchema,
  emptySchema,
  forgotPasswordSchema,
  loginAsSchema,
  profileSchema,
  setPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";
import {
  consumeToken,
  createPasswordLink,
  findTokenUser,
  PASSWORD_LINKS,
} from "@/server/core/accountTokens";
import { publicAction, userAction } from "@/server/core/action";
import { siteUrl } from "@/server/core/env";
import { ActionError } from "@/server/core/errors";
import { hashPassword, isOldHash, verifyPassword } from "@/server/core/password";
import { clientIp, limit } from "@/server/core/request";
import { endAllSessions, endSession, startSession } from "@/server/core/session";
import { db } from "@/server/db";
import { sendMail } from "@/server/email/send";
import {
  alreadyRegistered,
  passwordChanged,
  passwordReset,
  studentSignup,
} from "@/server/email/templates";

const BAD_LINK = "This link has expired or was already used. Ask for a new one.";

export const login = publicAction(
  "login",
  loginAsSchema,
  async (input): Promise<{ role: Role }> => {
    const email = input.email.toLowerCase();
    const ip = await clientIp();
    await limit("login-ip", ip, 50, 15);
    await limit("login", `${email}|${ip}`, 10, 15);
    await limit("login-email", email, 30, 60);
    const user = await db().user.findUnique({ where: { email } });
    const matches = await verifyPassword(input.password, user?.passwordHash ?? null);
    // The wrong login page gives the same answer, so it can't be used to find staff accounts.
    if (!user || !matches || user.archivedAt || user.role !== input.role)
      throw new ActionError("That email and password don't match.");
    if (!user.active) throw new ActionError("This account is paused. Contact the Reallogixs team.");
    if (user.passwordHash && isOldHash(user.passwordHash))
      await db().user.updateMany({
        where: { id: user.id, passwordHash: user.passwordHash },
        data: { passwordHash: await hashPassword(input.password) },
      });
    await startSession(user);
    return { role: user.role };
  },
);

export const logout = publicAction("logout", emptySchema, async (): Promise<void> => endSession());

/** The answer is always the same, so it can't be used to find out who has an account. */
export const requestSignup = publicAction("signup", signupSchema, async (input): Promise<void> => {
  const email = input.email.toLowerCase();
  await limit("signup-ip", await clientIp(), 20, 60);
  await limit("account-mail", email, 5, 60);
  // After the response, so how long it takes says nothing either.
  after(async () => {
    const client = db();
    const existing = await client.user.findUnique({ where: { email } });
    if (existing?.passwordHash) {
      await sendMail(
        email,
        alreadyRegistered(existing.name, siteUrl(LOGIN_PATH[existing.role])),
        existing.id,
      );
      return;
    }
    // A teacher or admin who hasn't set a password yet keeps their own invite.
    if (existing && (existing.role !== "student" || existing.archivedAt)) return;
    const user =
      existing ??
      (await client.user.create({
        data: { role: "student", name: input.name, email, phone: input.phone },
      }));
    const url = await createPasswordLink(client, user.id, "set_password");
    await sendMail(email, studentSignup(user.name, url), user.id);
  });
});

export const requestPasswordReset = publicAction(
  "forgot-password",
  forgotPasswordSchema,
  async (input): Promise<void> => {
    const email = input.email.toLowerCase();
    await limit("forgot-ip", await clientIp(), 20, 60);
    await limit("account-mail", email, 5, 60);
    after(async () => {
      const client = db();
      const user = await client.user.findUnique({ where: { email } });
      if (!user || !user.active || user.archivedAt) return;
      const url = await createPasswordLink(client, user.id, "reset_password");
      await sendMail(email, passwordReset(user.name, url), user.id);
    });
  },
);

/** Ends every invite, signup and reset: proves the email, sets the password, signs in. */
export const setPassword = publicAction(
  "set-password",
  setPasswordSchema,
  async (input): Promise<{ role: Role }> => {
    await limit("set-password", await clientIp(), 30, 15);
    const client = db();
    const userId = await findTokenUser(client, input.token, PASSWORD_LINKS);
    if (!userId) throw new ActionError(BAD_LINK);
    const passwordHash = await hashPassword(input.password);
    const user = await client.$transaction(async (tx) => {
      if (!(await consumeToken(tx, input.token, PASSWORD_LINKS))) throw new ActionError(BAD_LINK);
      const current = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (!current.active || current.archivedAt)
        throw new ActionError("This account is paused. Contact the Reallogixs team.");
      const updated = await tx.user.update({
        where: { id: userId },
        data: { passwordHash, emailVerifiedAt: current.emailVerifiedAt ?? new Date() },
      });
      await tx.session.deleteMany({ where: { userId } });
      // Guest orders join the account only now that the email is proven, and only by email.
      if (updated.role === "student")
        await tx.order.updateMany({
          where: { studentId: null, contactEmail: updated.email },
          data: { studentId: userId },
        });
      return { ...updated, hadPassword: Boolean(current.passwordHash) };
    });
    await startSession(user);
    if (user.hadPassword)
      after(() =>
        sendMail(user.email, passwordChanged(user.name, siteUrl("/forgot-password")), user.id),
      );
    return { role: user.role };
  },
);

export const changePassword = userAction(
  "change-password",
  changePasswordSchema,
  async (input, { id }): Promise<void> => {
    await limit("change-password", id, 10, 15);
    const client = db();
    const user = await client.user.findUniqueOrThrow({ where: { id } });
    if (!(await verifyPassword(input.current, user.passwordHash)))
      throw new ActionError("Your current password is incorrect.");
    const passwordHash = await hashPassword(input.next);
    await client.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { passwordHash } });
      await tx.authToken.deleteMany({ where: { userId: id } });
      await endAllSessions(tx, id, { keepCurrent: true });
    });
    after(() => sendMail(user.email, passwordChanged(user.name, siteUrl("/forgot-password")), id));
  },
);

export const updateProfile = userAction(
  "update-profile",
  profileSchema,
  async (input, { id }): Promise<void> => {
    await db().user.update({ where: { id }, data: { name: input.name, phone: input.phone } });
  },
);

"use server";

import { after } from "next/server";

import { LOGIN_PATH } from "@/lib/account/loginPath";
import { changeEmailSchema, confirmEmailSchema } from "@/lib/validation/auth";
import { consumeToken, createEmailLink, findEmailChange } from "@/server/core/accountTokens";
import { publicAction, roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { siteUrl } from "@/server/core/env";
import { ActionError } from "@/server/core/errors";
import { verifyPassword } from "@/server/core/password";
import { clientIp, limit } from "@/server/core/request";
import { db, type Tx } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { confirmNewEmail, emailChanging } from "@/server/email/templates";

async function assertFree(client: Tx, email: string): Promise<void> {
  if (await client.user.findUnique({ where: { email }, select: { id: true } }))
    throw new ActionError("Another account already uses this email.");
}

/** Nothing changes until the link sent to the new address is used, so a typo can't lock you out. */
export const requestEmailChange = roleAction(
  "change-email",
  "admin",
  changeEmailSchema,
  async (input, { id }): Promise<void> => {
    await limit("change-email", id, 10, 15);
    const client = db();
    const email = input.email.toLowerCase();
    const user = await client.user.findUniqueOrThrow({ where: { id } });
    if (!(await verifyPassword(input.password, user.passwordHash)))
      throw new ActionError("Your current password is incorrect.");
    if (email === user.email) throw new ActionError("That is already your email.");
    await assertFree(client, email);
    const url = await createEmailLink(client, id, email);
    await audit(client, id, "admin.email_requested", "user", id);
    if (!(await sendMail(email, confirmNewEmail(user.name, url), id)))
      throw new ActionError("The email couldn't be sent. Check the email settings and try again.");
    const reset = siteUrl("/forgot-password");
    after(() => sendMail(user.email, emailChanging(user.name, false, reset), id));
  },
);

/** Only used up by pressing the button, so email scanners that open the link can't spend it. */
export const confirmEmailChange = publicAction(
  "confirm-email",
  confirmEmailSchema,
  async ({ token }): Promise<{ next: string }> => {
    await limit("confirm-email", await clientIp(), 30, 15);
    const before = await db().$transaction(async (tx) => {
      const change = await findEmailChange(tx, token);
      if (!change || !(await consumeToken(tx, token, ["verify_email"])))
        throw new ActionError("This link has expired or was already used. Ask for a new one.");
      const user = await tx.user.findUniqueOrThrow({ where: { id: change.userId } });
      if (user.role !== "admin" || !user.active || user.archivedAt)
        throw new ActionError("This account is paused. Contact the Reallogixs team.");
      await assertFree(tx, change.newEmail);
      await tx.user.update({
        where: { id: user.id },
        data: { email: change.newEmail, emailVerifiedAt: new Date() },
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
      await tx.authToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      await audit(tx, user.id, "admin.email_changed", "user", user.id);
      return user;
    });
    after(() => sendMail(before.email, emailChanging(before.name, true, ""), before.id));
    return { next: LOGIN_PATH[before.role] };
  },
);

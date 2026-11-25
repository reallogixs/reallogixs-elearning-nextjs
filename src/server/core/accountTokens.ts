import "server-only";

import type { Tx } from "@/server/db";
import type { TokenPurpose } from "@/server/db/generated/enums";

import { siteUrl } from "./env";
import { hashSecret, newSecret } from "./tokens";

const HOUR = 3_600_000;
const LIFETIME: Record<TokenPurpose, number> = {
  set_password: 48 * HOUR,
  reset_password: HOUR,
  verify_email: 24 * HOUR,
};

/** Makes a one-time link. Earlier unused links for the user stop working. */
export async function createPasswordLink(
  client: Tx,
  userId: string,
  purpose: "set_password" | "reset_password",
): Promise<string> {
  const secret = newSecret();
  await client.authToken.deleteMany({ where: { userId } });
  await client.authToken.create({
    data: {
      userId,
      purpose,
      tokenHash: hashSecret(secret),
      expiresAt: new Date(Date.now() + LIFETIME[purpose]),
    },
  });
  return siteUrl(`/set-password?token=${secret}`);
}

/** Makes a link that moves the account to a new email once it is opened there. */
export async function createEmailLink(
  client: Tx,
  userId: string,
  newEmail: string,
): Promise<string> {
  const secret = newSecret();
  await client.authToken.deleteMany({ where: { userId, purpose: "verify_email" } });
  await client.authToken.create({
    data: {
      userId,
      newEmail,
      purpose: "verify_email",
      tokenHash: hashSecret(secret),
      expiresAt: new Date(Date.now() + LIFETIME.verify_email),
    },
  });
  return siteUrl(`/confirm-email?token=${secret}`);
}

/** Links only work for what they were made for: an email link can't set a password. */
export const PASSWORD_LINKS: TokenPurpose[] = ["set_password", "reset_password"];

function usable(secret: string, purposes: TokenPurpose[]) {
  return {
    tokenHash: hashSecret(secret),
    purpose: { in: purposes },
    usedAt: null,
    expiresAt: { gt: new Date() },
  };
}

/** The user a link belongs to, if it can still be used. Doesn't use it up. */
export async function findTokenUser(
  client: Tx,
  secret: string,
  purposes: TokenPurpose[],
): Promise<string | null> {
  const token = await client.authToken.findFirst({ where: usable(secret, purposes) });
  return token?.userId ?? null;
}

/** What an email link would change. Doesn't use it up. */
export async function findEmailChange(
  client: Tx,
  secret: string,
): Promise<{ userId: string; newEmail: string } | null> {
  const token = await client.authToken.findFirst({ where: usable(secret, ["verify_email"]) });
  return token?.newEmail ? { userId: token.userId, newEmail: token.newEmail } : null;
}

/** Uses the link up. Only one of two simultaneous attempts can win. */
export async function consumeToken(
  client: Tx,
  secret: string,
  purposes: TokenPurpose[],
): Promise<boolean> {
  const { count } = await client.authToken.updateMany({
    where: usable(secret, purposes),
    data: { usedAt: new Date() },
  });
  return count === 1;
}

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

/** The user a link belongs to, if it can still be used. Doesn't use it up. */
export async function findTokenUser(client: Tx, secret: string): Promise<string | null> {
  const token = await client.authToken.findUnique({ where: { tokenHash: hashSecret(secret) } });
  return token && !token.usedAt && token.expiresAt > new Date() ? token.userId : null;
}

/** Uses the link up. Only one of two simultaneous attempts can win. */
export async function consumeToken(client: Tx, secret: string): Promise<boolean> {
  const { count } = await client.authToken.updateMany({
    where: { tokenHash: hashSecret(secret), usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  return count === 1;
}

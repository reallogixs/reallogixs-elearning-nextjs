import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import type { Role } from "@/types/domain";
import { db, type Tx } from "@/server/db";

import { SESSION_COOKIE } from "./cookie";
import { hashSecret, newSecret } from "./tokens";

const HOUR = 3_600_000;
const LIFETIME: Record<Role, number> = {
  admin: 12 * HOUR,
  teacher: 30 * 24 * HOUR,
  student: 30 * 24 * HOUR,
};

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
}

/** The signed-in user, or null. Checked against the database once per request. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const secret = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!secret) return null;
  const session = await db().session.findUnique({
    where: { tokenHash: hashSecret(secret) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          phone: true,
          active: true,
          archivedAt: true,
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  const { active, archivedAt, ...user } = session.user;
  return active && !archivedAt ? user : null;
});

/** Signs the user in. Always a new secret, so an old cookie can't be carried over. */
export async function startSession(user: { id: string; role: Role }): Promise<void> {
  const previous = (await cookies()).get(SESSION_COOKIE)?.value;
  if (previous) await db().session.deleteMany({ where: { tokenHash: hashSecret(previous) } });
  const secret = newSecret();
  const expiresAt = new Date(Date.now() + LIFETIME[user.role]);
  await db().session.deleteMany({ where: { userId: user.id, expiresAt: { lte: new Date() } } });
  await db().session.create({
    data: { userId: user.id, tokenHash: hashSecret(secret), expiresAt },
  });
  (await cookies()).set(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Signs the user out everywhere, or everywhere except this browser. */
export async function endAllSessions(
  client: Tx,
  userId: string,
  { keepCurrent = false } = {},
): Promise<void> {
  const secret = keepCurrent ? (await cookies()).get(SESSION_COOKIE)?.value : undefined;
  await client.session.deleteMany({
    where: { userId, ...(secret ? { tokenHash: { not: hashSecret(secret) } } : {}) },
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const secret = jar.get(SESSION_COOKIE)?.value;
  if (secret) await db().session.deleteMany({ where: { tokenHash: hashSecret(secret) } });
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

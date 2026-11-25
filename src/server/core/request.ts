import "server-only";

import { headers } from "next/headers";

import { db } from "@/server/db";

import { ActionError } from "./errors";
import { allowAttempt } from "./rateLimit";

/** Vercel sets x-real-ip itself; elsewhere these headers are only as reliable as the proxy. */
export async function clientIp(): Promise<string> {
  const list = await headers();
  return list.get("x-real-ip") ?? list.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Stops the action with a clear message once a caller has tried too often. */
export async function limit(
  action: string,
  caller: string,
  max: number,
  windowMinutes: number,
): Promise<void> {
  const allowed = await allowAttempt(db(), action, caller, {
    max,
    windowSeconds: windowMinutes * 60,
  });
  if (!allowed) throw new ActionError("Too many attempts. Please wait a while and try again.");
}

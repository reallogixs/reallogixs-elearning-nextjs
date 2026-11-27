import { after } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { drainQueue, runQueue } from "@/server/email/worker";

/** Long enough for one run of the queue. */
export const maxDuration = 60;

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return (
    Boolean(secret) &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

/** Vercel Cron (daily): sends anything left over. */
export async function GET(request: Request): Promise<Response> {
  if (!authorised(request)) return new Response(null, { status: 401 });
  const result = await runQueue();
  if (result.remaining) after(drainQueue);
  return Response.json(result);
}

/** One run handing over to the next: answers at once and works afterwards. */
export async function POST(request: Request): Promise<Response> {
  if (!authorised(request)) return new Response(null, { status: 401 });
  after(drainQueue);
  return new Response(null, { status: 202 });
}

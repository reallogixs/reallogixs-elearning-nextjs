import "server-only";

import { buildCertificateEmail } from "@/server/core/certificates";
import { siteUrl } from "@/server/core/env";
import { db } from "@/server/db";

import type { EmailContent } from "./layout";
import { QUEUED_TEMPLATES, type QueuedTemplate } from "./queue";
import { errorCode, isTeacher, openMailer } from "./send";

/*
 * Sends the queue: takes a few due emails at a time, sends them over one connection at a steady
 * pace, retries failures with growing gaps, and hands over to a fresh run before its time is up.
 */

type Builder = (entityId: string) => Promise<{ to: string; content: EmailContent } | null>;

/** How to rebuild each queued template from the id stored with it. */
const BUILDERS: Record<QueuedTemplate, Builder> = {
  certificate_issued: buildCertificateEmail,
};

/** One email every 2 s (up to 1,800 an hour), to stay well inside the mailbox's sending limits. */
const SEND_GAP_MS = 2_000;
const CLAIM = 5;
const LEASE_SECONDS = 120;
const MAX_ATTEMPTS = 5;
/** Minutes to wait after the 1st, 2nd, 3rd and 4th failure. */
const BACKOFF = [1, 5, 15, 60];
/** Each run stops taking new emails after this, well inside Vercel's 60 s function limit. */
export const RUN_BUDGET_MS = 40_000;

interface Claimed {
  id: string;
  template: string;
  entity_id: string | null;
  attempts: number;
}

/** Takes the next few due emails. SKIP LOCKED lets several workers run without overlap. */
function claim(limit: number): Promise<Claimed[]> {
  return db().$queryRaw<Claimed[]>`
    UPDATE email_messages SET
      locked_until = now() + make_interval(secs => ${LEASE_SECONDS}::int),
      attempts = attempts + 1
    WHERE id IN (
      SELECT id FROM email_messages
      WHERE status = 'queued' AND next_attempt_at <= now()
        AND (locked_until IS NULL OR locked_until < now())
      ORDER BY next_attempt_at, created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, template, entity_id, attempts`;
}

async function settle(
  row: Claimed,
  outcome: { sent: true } | { sent: false; error: string; final?: boolean },
): Promise<void> {
  if (outcome.sent) {
    await db().emailMessage.update({
      where: { id: row.id },
      data: { status: "sent", sentAt: new Date(), lockedUntil: null, error: null },
    });
    return;
  }
  const final = outcome.final || row.attempts >= MAX_ATTEMPTS;
  const wait = BACKOFF[Math.min(row.attempts, BACKOFF.length) - 1] ?? 60;
  await db().emailMessage.update({
    where: { id: row.id },
    data: final
      ? { status: "failed", error: outcome.error, lockedUntil: null }
      : {
          error: outcome.error,
          lockedUntil: null,
          nextAttemptAt: new Date(Date.now() + wait * 60_000),
        },
  });
}

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface RunResult {
  sent: number;
  failed: number;
  /** Still queued and due now: another run should follow. */
  remaining: number;
}

/** Sends due emails until the time budget is spent. Safe to run several at once. */
export async function runQueue(budgetMs = RUN_BUDGET_MS): Promise<RunResult> {
  const until = Date.now() + budgetMs;
  const result = { sent: 0, failed: 0 };
  let mailer: ReturnType<typeof openMailer> | null = null;
  try {
    while (Date.now() < until) {
      const rows = await claim(CLAIM);
      if (!rows.length) break;
      try {
        mailer ??= openMailer({ pooled: true });
      } catch (error) {
        // No mail server at all (e.g. settings missing): count it as a failed try for each.
        const code = errorCode(error);
        for (const row of rows) await settle(row, { sent: false, error: code });
        result.failed += rows.length;
        break;
      }
      for (const row of rows) {
        const build = BUILDERS[row.template as QueuedTemplate] as Builder | undefined;
        try {
          const email = build && row.entity_id ? await build(row.entity_id) : null;
          if (!email || (await isTeacher(email.to))) {
            await settle(row, { sent: false, error: "not_sendable", final: true });
            result.failed += 1;
            continue;
          }
          await mailer.deliver(email.to, email.content);
          await settle(row, { sent: true });
          result.sent += 1;
        } catch (error) {
          const code = errorCode(error);
          console.error("[email-queue]", row.template, code);
          await settle(row, { sent: false, error: code });
          result.failed += 1;
        }
        await pause(SEND_GAP_MS);
      }
    }
  } finally {
    mailer?.close();
  }
  const remaining = await db().emailMessage.count({
    where: { status: "queued", nextAttemptAt: { lte: new Date() } },
  });
  return { ...result, remaining };
}

/**
 * Sends what it can now, then asks the site to start a fresh run for the rest, so a big class
 * never hits the time limit. Needs CRON_SECRET; without it the rest waits for the daily cron
 * or Admin → Email log → Send now.
 */
export async function drainQueue(): Promise<void> {
  const { remaining } = await runQueue();
  if (remaining) await requestNextRun();
}

export async function requestNextRun(): Promise<void> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;
  try {
    await fetch(siteUrl("/api/email-queue"), {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("[email-queue] next run", errorCode(error));
  }
}

/** Puts failed queued-type emails back in the queue. Returns how many. */
export async function retryFailed(): Promise<number> {
  const { count } = await db().emailMessage.updateMany({
    where: {
      status: "failed",
      template: { in: [...QUEUED_TEMPLATES] },
      error: { not: "not_sendable" },
    },
    data: {
      status: "queued",
      attempts: 0,
      nextAttemptAt: new Date(),
      lockedUntil: null,
      error: null,
    },
  });
  return count;
}

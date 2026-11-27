"use server";

import { emptySchema } from "@/lib/validation/auth";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { db } from "@/server/db";
import { requestNextRun, retryFailed, runQueue } from "@/server/email/worker";

/** A short run while the admin waits; anything left carries on in the background. */
const ADMIN_RUN_MS = 15_000;

export const sendQueuedNow = roleAction(
  "email-queue-run",
  "admin",
  emptySchema,
  async (_input, admin): Promise<{ notice: string }> => {
    const { sent, failed, remaining } = await runQueue(ADMIN_RUN_MS);
    await audit(db(), admin.id, "email.queue_run", "email", "queue", { sent, failed });
    if (remaining) await requestNextRun();
    const parts = [`${sent} sent`, ...(failed ? [`${failed} failed`] : [])];
    return {
      notice: remaining
        ? `${parts.join(", ")}. ${remaining} more are sending in the background.`
        : `${parts.join(", ")}. The queue is empty.`,
    };
  },
);

export const retryFailedEmails = roleAction(
  "email-queue-retry",
  "admin",
  emptySchema,
  async (_input, admin): Promise<{ notice: string }> => {
    const count = await retryFailed();
    await audit(db(), admin.id, "email.queue_retry", "email", "queue", { count });
    if (count) await requestNextRun();
    return {
      notice: count ? `${count} email(s) queued again.` : "Nothing to retry.",
    };
  },
);

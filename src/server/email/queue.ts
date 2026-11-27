import "server-only";

import type { Tx } from "@/server/db";

/*
 * Bulk email (e.g. a class's certificates). Each email is a row in email_messages with status
 * "queued"; nothing secret is stored, the email is rebuilt from its record when it is sent by
 * the worker (`worker.ts`).
 */

/** Templates the worker can rebuild from the id stored with each email. */
export const QUEUED_TEMPLATES = ["certificate_issued"] as const;
export type QueuedTemplate = (typeof QUEUED_TEMPLATES)[number];

export interface QueuedEmail {
  template: QueuedTemplate;
  entityId: string;
  to: string;
  subject: string;
}

/** Adds emails to the queue, in the caller's transaction. One queued copy per email at most. */
export async function enqueueEmails(tx: Tx, emails: QueuedEmail[]): Promise<void> {
  if (emails.length)
    await tx.emailMessage.createMany({
      data: emails.map((email) => ({ ...email, status: "queued" as const })),
      skipDuplicates: true,
    });
}

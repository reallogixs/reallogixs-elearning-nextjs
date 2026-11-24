import type { EmailKind, OutboxEmail } from "@/types/domain";
import { newId } from "@/lib/domain/ids";

import { nowIso, write } from "./client";

/**
 * MOCK MAILER. Writes to the admin outbox instead of sending. Swap the body of this
 * function for Nodemailer (Hostinger SMTP) when the backend lands.
 */
export function sendEmail(
  kind: EmailKind,
  to: string,
  subject: string,
  body: string,
  attachments?: OutboxEmail["attachments"],
): void {
  const email: OutboxEmail = {
    id: newId("eml"),
    kind,
    to,
    subject,
    body,
    attachments,
    createdAt: nowIso(),
  };
  write((db) => ({ ...db, outbox: [email, ...db.outbox] }));
}

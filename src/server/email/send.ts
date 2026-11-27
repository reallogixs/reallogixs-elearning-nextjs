import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { createTransport, type Transporter } from "nodemailer";

import { mailConfig } from "@/server/core/env";
import { db } from "@/server/db";

import type { EmailContent } from "./layout";
import { LOGO_CID, LOGO_PNG_BASE64 } from "./logo";

/**
 * Development without SMTP: emails land in the git-ignored `.mail` folder so links can be
 * opened. Never in production, where a missing SMTP setting is a failure.
 */
async function saveLocally(to: string, content: EmailContent): Promise<void> {
  await mkdir(".mail", { recursive: true });
  const name = `.mail/${Date.now()}-${content.template}`;
  await writeFile(`${name}.txt`, `To: ${to}\nSubject: ${content.subject}\n\n${content.text}\n`);
  // A copy to open in a browser, with the logo inline.
  await writeFile(
    `${name}.html`,
    content.html.replace(`cid:${LOGO_CID}`, `data:image/png;base64,${LOGO_PNG_BASE64}`),
  );
  for (const file of content.attachments ?? [])
    await writeFile(`${name}-${file.filename}`, file.content);
}

export interface Mailer {
  deliver: (to: string, content: EmailContent) => Promise<void>;
  close: () => void;
}

/**
 * A connection to the mail server. Batches keep one open for many emails instead of logging in
 * for each, which is faster and kinder to the mailbox's limits.
 */
export function openMailer({ pooled = false } = {}): Mailer {
  const config = mailConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP is not set up.");
    return { deliver: saveLocally, close: () => undefined };
  }
  const transport: Transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    socketTimeout: 20_000,
    ...(pooled ? { pool: true, maxConnections: 1, maxMessages: 100 } : {}),
  });
  return {
    async deliver(to, content) {
      await transport.sendMail({
        from: config.from,
        to,
        subject: content.subject,
        text: content.text,
        html: content.html,
        attachments: [
          {
            filename: "reallogixs.png",
            content: Buffer.from(LOGO_PNG_BASE64, "base64"),
            contentType: "image/png",
            cid: LOGO_CID,
          },
          ...(content.attachments ?? []).map(({ content: file, ...rest }) => ({
            ...rest,
            content: Buffer.from(file),
          })),
        ],
      });
    },
    close: () => transport.close(),
  };
}

/** Teachers are never emailed: admins pass their password links on themselves. */
export async function isTeacher(to: string): Promise<boolean> {
  const user = await db().user.findUnique({
    where: { email: to.toLowerCase() },
    select: { role: true },
  });
  return user?.role === "teacher";
}

/** A short, safe reason for the log: never the server's full message. */
export function errorCode(error: unknown): string {
  return error instanceof Error && "code" in error ? String(error.code) : "unknown";
}

/**
 * Sends one email now and records the attempt (never the text, which can hold one-time links).
 * For many at once, use the queue in `queue.ts`.
 */
export async function sendMail(
  to: string,
  content: EmailContent,
  entityId?: string,
): Promise<boolean> {
  if (await isTeacher(to)) return false;
  const { id } = await db().emailMessage.create({
    data: { template: content.template, to, subject: content.subject, entityId, attempts: 1 },
    select: { id: true },
  });
  const mailer = openMailer();
  try {
    await mailer.deliver(to, content);
    await db().emailMessage.update({ where: { id }, data: { status: "sent", sentAt: new Date() } });
    return true;
  } catch (error) {
    const code = errorCode(error);
    await db().emailMessage.update({ where: { id }, data: { status: "failed", error: code } });
    console.error("[email]", content.template, code);
    return false;
  } finally {
    mailer.close();
  }
}

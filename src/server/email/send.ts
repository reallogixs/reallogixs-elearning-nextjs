import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { createTransport } from "nodemailer";

import { mailConfig } from "@/server/core/env";
import { db } from "@/server/db";

import type { EmailContent } from "./templates";

/**
 * Development without SMTP: emails land in the git-ignored `.mail` folder so links can be
 * opened. Never in production, where a missing SMTP setting is a failure.
 */
async function saveLocally(to: string, content: EmailContent): Promise<void> {
  await mkdir(".mail", { recursive: true });
  const name = `.mail/${Date.now()}-${content.template}`;
  await writeFile(`${name}.txt`, `To: ${to}\nSubject: ${content.subject}\n\n${content.text}\n`);
  for (const file of content.attachments ?? [])
    await writeFile(`${name}-${file.filename}`, file.content);
}

async function deliver(to: string, content: EmailContent): Promise<void> {
  const config = mailConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP is not set up.");
    return saveLocally(to, content);
  }
  const transport = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    socketTimeout: 20_000,
  });
  await transport.sendMail({
    from: config.from,
    to,
    subject: content.subject,
    text: content.text,
    html: content.html,
    attachments: content.attachments?.map(({ content: file, ...rest }) => ({
      ...rest,
      content: Buffer.from(file),
    })),
  });
}

/** Sends and records the attempt (never the text, which can hold one-time links). */
export async function sendMail(
  to: string,
  content: EmailContent,
  entityId?: string,
): Promise<boolean> {
  const { id } = await db().emailMessage.create({
    data: { template: content.template, to, subject: content.subject, entityId, attempts: 1 },
    select: { id: true },
  });
  try {
    await deliver(to, content);
    await db().emailMessage.update({ where: { id }, data: { status: "sent", sentAt: new Date() } });
    return true;
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "unknown";
    await db().emailMessage.update({ where: { id }, data: { status: "failed", error: code } });
    console.error("[email]", content.template, code);
    return false;
  }
}

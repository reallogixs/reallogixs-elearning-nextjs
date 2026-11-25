import "server-only";

import { cache } from "react";

import type { Certificate } from "@/types/domain";
import type { EmailLogEntry, JoinInfo } from "@/types/portal";
import { db } from "@/server/db";

import { toCertificate } from "./orderShape";

/** Null for a link that was never valid or has been replaced. Never includes who it belongs to. */
export async function getJoinInfo(token: string): Promise<JoinInfo | null> {
  const registrant = await db().registrant.findFirst({
    where: { joinToken: token, revokedAt: null },
    include: { meeting: { include: { course: true } } },
  });
  if (!registrant) return null;
  const { course, status, completedAt } = registrant.meeting;
  return {
    title: course.title,
    startsAt: course.startsAt.toISOString(),
    durationMinutes: course.durationMinutes,
    status,
    completedAt: completedAt?.toISOString() ?? null,
  };
}

/** Public: exactly what is printed on the certificate, plus whether it still counts. */
export const findCertificate = cache(async (code: string): Promise<Certificate | null> => {
  const row = await db().certificate.findUnique({ where: { code: code.trim().toUpperCase() } });
  // The order behind it stays private.
  return row && toCertificate(row, { number: "", courseId: "" });
});

const EMAILS_SHOWN = 200;

/** Admin only: the page that calls this checks the role. */
export async function listEmails(): Promise<EmailLogEntry[]> {
  const rows = await db().emailMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: EMAILS_SHOWN,
    select: { id: true, subject: true, to: true, status: true, createdAt: true },
  });
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

import "server-only";

import { formatClassTime, formatDate } from "@/lib/domain/format";
import { siteUrl } from "@/server/core/env";
import { db, type Tx } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { zoomInvite } from "@/server/email/templates";

export function classTime(course: { startsAt: Date; durationMinutes: number }): string {
  const startsAt = course.startsAt.toISOString();
  return `${formatDate(startsAt)}, ${formatClassTime(startsAt, course.durationMinutes)}`;
}

/** Emails a registered student their personal link. Returns whether it was sent. */
export async function sendInvite(registrantId: string): Promise<boolean> {
  const { order, ...registrant } = await db().registrant.findUniqueOrThrow({
    where: { id: registrantId },
    include: { order: { include: { course: true } } },
  });
  return sendMail(
    registrant.email,
    zoomInvite(order.contactName, {
      course: order.course.title,
      when: classTime(order.course),
      email: registrant.email,
      url: siteUrl(`/join/${registrant.joinToken}`),
    }),
    order.id,
  );
}

/** The link stops working and they leave the class if inside. Attendance is kept. */
export async function revokeRegistrants(tx: Tx, orderId: string): Promise<{ email: string }[]> {
  const now = new Date();
  const active = await tx.registrant.findMany({ where: { orderId, revokedAt: null } });
  const ids = active.map(({ id }) => id);
  await tx.attendance.updateMany({
    where: { registrantId: { in: ids }, leftAt: null },
    data: { leftAt: now },
  });
  await tx.registrant.updateMany({ where: { id: { in: ids } }, data: { revokedAt: now } });
  return active;
}

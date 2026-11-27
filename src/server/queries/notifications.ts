import "server-only";

import type { AdminNotice } from "@/types/portal";
import { formatPKR } from "@/lib/domain/format";
import { db } from "@/server/db";

const DAY = 86_400_000;

/**
 * Only what needs an admin: payments to check, classes to start or complete, emails that
 * failed. Worked out from the data each time, so nothing goes stale.
 */
export async function adminNotices(): Promise<AdminNotice[]> {
  const now = Date.now();
  const client = db();
  const [pending, meetings, failed] = await Promise.all([
    client.order.findMany({
      where: { status: "pending" },
      orderBy: { updatedAt: "asc" },
      select: {
        number: true,
        contactName: true,
        total: true,
        updatedAt: true,
        course: { select: { title: true } },
        _count: { select: { receipts: true } },
      },
    }),
    client.meeting.findMany({
      where: {
        completedAt: null,
        course: { archivedAt: null },
        OR: [
          { status: { in: ["live", "ended"] } },
          { status: "scheduled", course: { startsAt: { lte: new Date(now + DAY) } } },
        ],
      },
      select: {
        status: true,
        course: { select: { id: true, title: true, startsAt: true } },
        _count: { select: { registrants: { where: { revokedAt: null } } } },
      },
    }),
    client.emailMessage.findMany({
      where: { status: "failed", createdAt: { gte: new Date(now - 7 * DAY) } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, subject: true, to: true, createdAt: true },
    }),
  ]);

  const payments = pending.map((order): AdminNotice => ({
    id: `order-${order.number}`,
    kind: "payment",
    urgent: now - order.updatedAt.getTime() > DAY,
    title:
      order._count.receipts > 1
        ? `New receipt from ${order.contactName}`
        : `${order.contactName} paid ${formatPKR(order.total)}`,
    body: `${order.course.title} · ${order.number} needs confirmation.`,
    at: order.updatedAt.toISOString(),
    href: `/admin/payments?order=${order.number}`,
  }));
  const classes = meetings.map(({ status, course, _count }): AdminNotice => {
    const href = `/admin/classes/${course.id}`;
    const at = course.startsAt.toISOString();
    if (status === "ended")
      return {
        id: `class-${course.id}`,
        kind: "class",
        urgent: true,
        title: `Complete ${course.title}`,
        body: "The class has ended. Mark it completed to send certificates.",
        at,
        href,
      };
    if (status === "live")
      return {
        id: `class-${course.id}`,
        kind: "class",
        urgent: false,
        title: `${course.title} is live`,
        body: "End it from the class page when it finishes.",
        at,
        href,
      };
    const late = course.startsAt.getTime() < now;
    return {
      id: `class-${course.id}`,
      kind: "class",
      urgent: late,
      title: late ? `${course.title} should have started` : `${course.title} starts soon`,
      body: `${_count.registrants} registered. Start the class when you're ready.`,
      at,
      href,
    };
  });
  const emails = failed.map((email): AdminNotice => ({
    id: `email-${email.id}`,
    kind: "email",
    urgent: false,
    title: "An email couldn't be sent",
    body: `“${email.subject}” to ${email.to}. Check the email settings.`,
    at: email.createdAt.toISOString(),
    href: "/admin/emails",
  }));
  return [...payments, ...classes, ...emails].sort(
    (a, b) => Number(b.urgent) - Number(a.urgent) || a.at.localeCompare(b.at),
  );
}

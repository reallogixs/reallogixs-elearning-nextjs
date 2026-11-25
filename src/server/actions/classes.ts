"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";

import { idSchema } from "@/lib/validation/admin";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { issueCertificates, sendCertificates } from "@/server/core/certificates";
import { ActionError } from "@/server/core/errors";
import { lockMeeting } from "@/server/core/locks";
import { TAG } from "@/server/core/tags";
import { db, type Tx } from "@/server/db";

/* Ids are course ids: each course has one class. Start and end stand in for Zoom's webhooks. */

async function findMeeting(tx: Tx, courseId: string) {
  await lockMeeting(tx, courseId);
  const meeting = await tx.meeting.findUnique({
    where: { courseId },
    include: { course: { select: { title: true, archivedAt: true } } },
  });
  if (!meeting || meeting.course.archivedAt) throw new ActionError("Class not found.");
  return meeting;
}

/** Everyone still inside leaves when the class ends. */
async function emptyRoom(tx: Tx, meetingId: string, at: Date): Promise<void> {
  await tx.attendance.updateMany({
    where: { registrant: { meetingId }, leftAt: null },
    data: { leftAt: at },
  });
}

/** Enrolment closes once the class is running. */
export const startClass = roleAction(
  "start-class",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const meeting = await findMeeting(tx, id);
      if (meeting.status !== "scheduled")
        throw new ActionError("This class has already been started.");
      await tx.meeting.update({
        where: { courseId: id },
        data: { status: "live", startedAt: new Date() },
      });
      await tx.course.update({ where: { id }, data: { enrolmentOpen: false } });
      await audit(tx, admin.id, "class.start", "course", id);
    });
    updateTag(TAG.catalogue);
  },
);

export const endClass = roleAction(
  "end-class",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const meeting = await findMeeting(tx, id);
      if (meeting.status !== "live") throw new ActionError("This class isn't running.");
      const endedAt = new Date();
      await emptyRoom(tx, meeting.id, endedAt);
      await tx.meeting.update({ where: { courseId: id }, data: { status: "ended", endedAt } });
      await audit(tx, admin.id, "class.end", "course", id);
    });
    updateTag(TAG.catalogue);
  },
);

/** The only way certificates are made. Ends the class first if it is still running. */
export const completeClass = roleAction(
  "complete-class",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<{ issued: number }> => {
    const certificates = await db().$transaction(async (tx) => {
      const { startedAt, ...meeting } = await findMeeting(tx, id);
      if (meeting.completedAt) throw new ActionError("This class is already completed.");
      if (!startedAt) throw new ActionError("The class hasn't been held yet. Start it first.");
      const now = new Date();
      await emptyRoom(tx, meeting.id, now);
      await tx.meeting.update({
        where: { courseId: id },
        data: { status: "ended", endedAt: meeting.endedAt ?? now, completedAt: now },
      });
      const ids = await issueCertificates(
        tx,
        { id: meeting.id, courseId: id, startedAt },
        meeting.course.title,
      );
      await audit(tx, admin.id, "class.complete", "course", id, { issued: ids.length });
      return ids;
    });
    updateTag(TAG.catalogue);
    after(() => sendCertificates(certificates));
    return { issued: certificates.length };
  },
);

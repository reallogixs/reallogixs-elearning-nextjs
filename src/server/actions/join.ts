"use server";

import { ADMISSION_MESSAGE, refusal } from "@/lib/domain/meeting";
import { joinSchema } from "@/lib/validation/certificate";
import { publicAction } from "@/server/core/action";
import { ActionError } from "@/server/core/errors";
import { holdMeeting, lockOrder } from "@/server/core/locks";
import { clientIp, limit } from "@/server/core/request";
import { db, type Tx } from "@/server/db";

/*
 * Stands in for Zoom's door. The real personal link opens Zoom, which checks the signed-in
 * account; here the student says which Zoom account they use.
 */
async function findRegistrant(client: Tx, token: string) {
  const registrant = await client.registrant.findFirst({
    where: { joinToken: token, revokedAt: null },
    include: { meeting: true, order: { select: { number: true, status: true } } },
  });
  if (!registrant) throw new ActionError(ADMISSION_MESSAGE.invalid_link);
  return registrant;
}

async function limitDoor(token: string): Promise<void> {
  await limit("join-ip", await clientIp(), 200, 15);
  await limit("join", token, 20, 15);
}

export const joinClass = publicAction(
  "join-class",
  joinSchema,
  async ({ token, email }): Promise<void> => {
    await limitDoor(token);
    const refused = await db().$transaction(async (tx) => {
      const { order, meeting } = await findRegistrant(tx, token);
      await lockOrder(tx, order.number);
      await holdMeeting(tx, meeting.courseId);
      // Read again now nothing can change underneath.
      const now = await findRegistrant(tx, token);
      const reason = refusal(
        { email: now.email, orderStatus: now.order.status, meetingStatus: now.meeting.status },
        email,
      );
      // Arriving early or late with the right account isn't worth flagging to the host.
      if (reason === "wrong_email" || reason === "not_paid")
        await tx.joinRefusal.create({
          data: { meetingId: meeting.id, email, reason: ADMISSION_MESSAGE[reason] },
        });
      if (reason) return reason;
      const inside = await tx.attendance.findFirst({
        where: { registrantId: now.id, leftAt: null },
      });
      if (!inside) await tx.attendance.create({ data: { registrantId: now.id } });
      return null;
    });
    if (refused) throw new ActionError(ADMISSION_MESSAGE[refused]);
  },
);

export const leaveClass = publicAction(
  "leave-class",
  joinSchema,
  async ({ token, email }): Promise<void> => {
    await limitDoor(token);
    const registrant = await findRegistrant(db(), token);
    if (registrant.email !== email) throw new ActionError(ADMISSION_MESSAGE.wrong_email);
    await db().attendance.updateMany({
      where: { registrantId: registrant.id, leftAt: null },
      data: { leftAt: new Date() },
    });
  },
);

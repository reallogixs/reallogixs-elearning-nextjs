"use server";

import { changeRegistrantSchema, orderSchema } from "@/lib/validation/admin";
import * as zoom from "@/lib/zoom/client";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { ActionError } from "@/server/core/errors";
import { lockOrder } from "@/server/core/locks";
import { revokeRegistrants, sendInvite } from "@/server/core/registration";
import { db } from "@/server/db";

const NOT_SENT = "Saved, but the email couldn't be sent. Check the email settings and resend it.";

async function findRegistrant(number: string) {
  const registrant = await db().registrant.findFirst({
    where: { order: { number, status: "confirmed" }, revokedAt: null },
    include: { meeting: true, order: { select: { id: true, contactName: true } } },
  });
  if (!registrant) throw new ActionError("Registrant not found.");
  return registrant;
}

/** For a student whose Zoom account uses another email: new link, the old one stops working. */
export const changeRegistrantEmail = roleAction(
  "registrant-email",
  "admin",
  changeRegistrantSchema,
  async (input, admin): Promise<{ notice: string }> => {
    const email = input.email.toLowerCase();
    const current = await findRegistrant(input.number);
    const { meeting, order } = current;
    if (meeting.status === "ended") throw new ActionError("This class has already ended.");
    if (email === current.email)
      throw new ActionError("They're already registered with this email.");
    const { joinToken } = await zoom.addRegistrant(meeting.zoomId, {
      name: order.contactName,
      email,
    });
    const id = await db()
      .$transaction(async (tx) => {
        await lockOrder(tx, input.number);
        const taken = await tx.registrant.findFirst({
          where: { meetingId: meeting.id, email, revokedAt: null },
        });
        if (taken) throw new ActionError("Another student is registered with this email.");
        const removed = await revokeRegistrants(tx, order.id);
        if (!removed.length) throw new ActionError("Registrant not found.");
        const created = await tx.registrant.create({
          data: { meetingId: meeting.id, orderId: order.id, email, joinToken },
        });
        await audit(tx, admin.id, "registrant.email", "order", order.id);
        return created.id;
      })
      .catch(async (error: unknown) => {
        await zoom.removeRegistrant(meeting.zoomId, email);
        throw error;
      });
    await zoom.removeRegistrant(meeting.zoomId, current.email);
    return { notice: (await sendInvite(id)) ? "Email changed and a new link sent." : NOT_SENT };
  },
);

export const resendInvite = roleAction(
  "resend-invite",
  "admin",
  orderSchema,
  async ({ number }, admin): Promise<void> => {
    const { id, order } = await findRegistrant(number);
    await audit(db(), admin.id, "registrant.resend", "order", order.id);
    if (!(await sendInvite(id)))
      throw new ActionError("The email couldn't be sent. Check the email settings.");
  },
);

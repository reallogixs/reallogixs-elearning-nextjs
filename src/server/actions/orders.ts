"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";

import { orderSchema, rejectOrderSchema } from "@/lib/validation/admin";
import * as zoom from "@/lib/zoom/client";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { siteUrl } from "@/server/core/env";
import { ActionError } from "@/server/core/errors";
import { holdMeeting, lockCourse, lockOrder } from "@/server/core/locks";
import { classTime, revokeRegistrants, sendInvite } from "@/server/core/registration";
import { TAG } from "@/server/core/tags";
import { db, type Tx } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { orderConfirmed, orderRejected } from "@/server/email/templates";
import { getContent } from "@/server/queries/content";

async function findOrder(client: Tx, number: string) {
  const order = await client.order.findUnique({
    where: { number },
    include: { course: { include: { meeting: true } }, commission: true, certificate: true },
  });
  if (!order) throw new ActionError("Order not found.");
  return order;
}

const ENDED =
  "This class has already ended, so the student can't join. Cancel the order and refund them.";
const NOT_PENDING = "Only orders awaiting verification can be";

/**
 * Takes a seat and registers the student on the class. The course is locked, so two admins
 * can't both sell the last seat. An order is only confirmed if the student can get in.
 */
export const confirmOrder = roleAction(
  "confirm-order",
  "admin",
  orderSchema,
  async ({ number }, admin): Promise<void> => {
    const order = await findOrder(db(), number);
    const { meeting } = order.course;
    if (order.status !== "pending") throw new ActionError(`${NOT_PENDING} confirmed.`);
    if (!meeting) throw new ActionError("This course has no Zoom meeting.");
    if (meeting.status === "ended") throw new ActionError(ENDED);
    const person = { name: order.contactName, email: order.contactEmail };
    const { whatsappUrl } = (await getContent()).community;
    // Outside the transaction: it talks to Zoom.
    const { joinToken } = await zoom.addRegistrant(meeting.zoomId, person);

    const registrantId = await db()
      .$transaction(async (tx) => {
        await lockCourse(tx, order.courseId);
        await holdMeeting(tx, order.courseId);
        const now = await tx.meeting.findUniqueOrThrow({ where: { id: meeting.id } });
        if (now.status === "ended") throw new ActionError(ENDED);
        const course = await tx.course.findUniqueOrThrow({
          where: { id: order.courseId },
          select: {
            seats: true,
            _count: { select: { orders: { where: { status: "confirmed" } } } },
          },
        });
        if (course._count.orders >= course.seats)
          throw new ActionError("This class is full. Increase the seats or contact the student.");
        const taken = await tx.registrant.findFirst({
          where: { meetingId: meeting.id, email: person.email, revokedAt: null },
        });
        if (taken)
          throw new ActionError(
            "This email is already registered for this class under another order.",
          );
        const { count } = await tx.order.updateMany({
          where: { id: order.id, status: "pending" },
          data: { status: "confirmed", confirmedAt: new Date() },
        });
        if (!count) throw new ActionError(`${NOT_PENDING} confirmed.`);
        const registrant = await tx.registrant.create({
          data: { meetingId: meeting.id, orderId: order.id, email: person.email, joinToken },
        });
        await tx.orderEvent.create({
          data: { orderId: order.id, type: "confirmed", actorId: admin.id },
        });
        await audit(tx, admin.id, "order.confirm", "order", order.id);
        return registrant.id;
      })
      .catch(async (error: unknown) => {
        await zoom.removeRegistrant(meeting.zoomId, person.email);
        throw error;
      });

    updateTag(TAG.catalogue);
    after(async () => {
      const { course } = order;
      await sendMail(
        person.email,
        orderConfirmed(person.name, { course: course.title, when: classTime(course), whatsappUrl }),
        order.id,
      );
      await sendInvite(registrantId);
    });
  },
);

export const rejectOrder = roleAction(
  "reject-order",
  "admin",
  rejectOrderSchema,
  async ({ number, reason }, admin): Promise<void> => {
    const order = await findOrder(db(), number);
    await db().$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: order.id, status: "pending" },
        data: { status: "rejected", rejectionReason: reason },
      });
      if (!count) throw new ActionError(`${NOT_PENDING} rejected.`);
      await tx.orderEvent.create({
        data: { orderId: order.id, type: "rejected", note: reason, actorId: admin.id },
      });
      await audit(tx, admin.id, "order.reject", "order", order.id);
    });
    const url = siteUrl(`/track?order=${number}`);
    after(() =>
      sendMail(
        order.contactEmail,
        orderRejected(order.contactName, { number, reason, url }),
        order.id,
      ),
    );
  },
);

/** Frees the seat and stops the class link. The record stays. */
export const cancelOrder = roleAction(
  "cancel-order",
  "admin",
  orderSchema,
  async ({ number }, admin): Promise<void> => {
    const result = await db().$transaction(async (tx) => {
      await lockOrder(tx, number);
      const order = await findOrder(tx, number);
      if (order.status === "cancelled") throw new ActionError("This order is already cancelled.");
      if (order.commission?.payoutId)
        throw new ActionError("This order's commission has already been paid out.");
      if (order.certificate && !order.certificate.revokedAt)
        throw new ActionError("This student has a certificate. Revoke it before cancelling.");
      await tx.order.update({
        where: { id: order.id },
        data: { status: "cancelled", rejectionReason: null },
      });
      const removed = await revokeRegistrants(tx, order.id);
      await tx.orderEvent.create({
        data: { orderId: order.id, type: "cancelled", actorId: admin.id },
      });
      await audit(tx, admin.id, "order.cancel", "order", order.id);
      return { zoomId: order.course.meeting?.zoomId, removed };
    });
    for (const { email } of result.removed)
      if (result.zoomId) await zoom.removeRegistrant(result.zoomId, email);
    updateTag(TAG.catalogue);
  },
);

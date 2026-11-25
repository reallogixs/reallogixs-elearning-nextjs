"use server";

import { after } from "next/server";

import type { OrderResult, PromoPreview } from "@/types/portal";
import { courseEnrolment } from "@/lib/domain/catalogue";
import { formatPKR, normalisePhone } from "@/lib/domain/format";
import { newOrderNumber } from "@/lib/domain/ids";
import { commissionFor, priceFor } from "@/lib/domain/pricing";
import {
  orderLookupSchema,
  placeOrderSchema,
  promoCodeSchema,
  reuploadSchema,
} from "@/lib/validation/checkout";
import { publicAction } from "@/server/core/action";
import { siteUrl } from "@/server/core/env";
import { ActionError } from "@/server/core/errors";
import { lockOrder } from "@/server/core/locks";
import { clientIp, limit } from "@/server/core/request";
import { db } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { orderReceived } from "@/server/email/templates";
import { removeFile, saveReceipt } from "@/server/files/storage";
import { getPublicCatalogue } from "@/server/queries/catalogue";
import { orderResult } from "@/server/queries/orders";

async function findTeacher(code: string) {
  return db().teacherProfile.findFirst({
    where: { promoCode: code.toUpperCase(), user: { active: true, archivedAt: null } },
    include: { user: { select: { name: true } } },
  });
}

export const checkPromoCode = publicAction(
  "promo-code",
  promoCodeSchema,
  async ({ code }): Promise<PromoPreview> => {
    await limit("promo", await clientIp(), 30, 15);
    const teacher = await findTeacher(code);
    if (!teacher)
      throw new ActionError("That code isn't valid. Check with your teacher, or skip this step.");
    return {
      code: teacher.promoCode,
      teacherName: teacher.user.name,
      discountPct: teacher.discountPct.toNumber(),
    };
  },
);

/** Price, discount and commission are worked out here; the browser's total is only compared. */
export const placeOrder = publicAction(
  "place-order",
  placeOrderSchema,
  async (input, user): Promise<OrderResult> => {
    const student = user?.role === "student" ? user : null;
    const email = student?.email ?? input.contact.email.toLowerCase();
    const ip = await clientIp();
    await limit("order-ip", ip, 20, 60);
    await limit("order", `${email}|${ip}`, 8, 60);

    const { courses } = await getPublicCatalogue();
    const course = courses.find((item) => item.id === input.courseId);
    if (!course) throw new ActionError("This course is no longer available.");
    if (courseEnrolment(course) !== "open")
      throw new ActionError("Enrolment for this class has closed.");
    const client = db();
    const duplicate = await client.order.findFirst({
      where: { courseId: course.id, contactEmail: email, status: { not: "cancelled" } },
      select: { id: true },
    });
    if (duplicate)
      throw new ActionError(
        "This email already has an order for this class. Check it on Track enrolment.",
      );
    const method = await client.paymentMethod.findFirst({
      where: { id: input.paymentMethodId, enabled: true, archivedAt: null },
    });
    if (!method)
      throw new ActionError("That payment method isn't available. Go back and choose another.");
    const teacher = input.promoCode ? await findTeacher(input.promoCode) : null;
    if (input.promoCode && !teacher)
      throw new ActionError("That promo code isn't valid any more. Remove it and try again.");

    const price = priceFor(course, teacher?.discountPct.toNumber() ?? 0);
    if (price.total !== input.expectedTotal)
      throw new ActionError(
        `The price is now ${formatPKR(price.total)}. Refresh the page and check it, or contact us if you've already paid.`,
      );

    const file = await saveReceipt(input.file);
    const order = await client.order
      .create({
        data: {
          number: newOrderNumber(),
          courseId: course.id,
          studentId: student?.id,
          contactName: input.contact.name,
          contactEmail: email,
          contactPhone: input.contact.phone,
          phoneKey: normalisePhone(input.contact.phone),
          teacherId: teacher?.userId,
          promoCode: teacher?.promoCode,
          priceBase: price.base,
          discountPct: price.discountPct,
          discount: price.discount,
          total: price.total,
          paymentMethodId: method.id,
          receipts: {
            create: {
              ...file,
              fileName: input.file.name.slice(0, 200),
              transactionRef: input.transactionRef,
            },
          },
          events: { create: { type: "placed" } },
          commission: teacher
            ? {
                create: {
                  teacherId: teacher.userId,
                  pct: teacher.commissionPct,
                  amount: commissionFor(price.total, teacher.commissionPct.toNumber()),
                },
              }
            : undefined,
        },
      })
      .catch(async (error: unknown) => {
        await removeFile("receipts", file.publicId);
        throw error;
      });

    after(() =>
      sendMail(
        email,
        orderReceived(order.contactName, {
          number: order.number,
          course: course.title,
          amount: formatPKR(order.total),
          url: siteUrl(`/track?order=${order.number}`),
        }),
        order.id,
      ),
    );
    return orderResult(order.id);
  },
);

const NOT_FOUND = "We couldn't find an order with that number and phone. Check both and try again.";

/** Both the number and the phone must match. Guessing is limited per visitor and per order. */
async function findOwned(number: string, phone: string): Promise<{ id: string }> {
  const ip = await clientIp();
  await limit("track-ip", ip, 40, 15);
  await limit("track", `${number}|${ip}`, 10, 15);
  await limit("track-order", number, 60, 60);
  const order = await db().order.findFirst({
    where: { number, phoneKey: normalisePhone(phone) },
    select: { id: true },
  });
  if (!order) throw new ActionError(NOT_FOUND);
  return order;
}

export const lookupOrder = publicAction(
  "track-order",
  orderLookupSchema,
  async ({ orderId, phone }): Promise<OrderResult> => {
    const { id } = await findOwned(orderId, phone);
    return orderResult(id);
  },
);

export const reuploadReceipt = publicAction(
  "reupload-receipt",
  reuploadSchema,
  async ({ orderId, phone, file, transactionRef }): Promise<OrderResult> => {
    const { id } = await findOwned(orderId, phone);
    await limit("reupload", orderId, 10, 60);
    const stored = await saveReceipt(file);
    try {
      await db().$transaction(async (tx) => {
        await lockOrder(tx, orderId);
        const { count } = await tx.order.updateMany({
          where: { id, status: "rejected" },
          data: { status: "pending", rejectionReason: null },
        });
        if (!count) throw new ActionError("This order isn't waiting for a new receipt.");
        await tx.receipt.create({
          data: { ...stored, orderId: id, fileName: file.name.slice(0, 200), transactionRef },
        });
        await tx.orderEvent.create({ data: { orderId: id, type: "receipt_uploaded" } });
      });
    } catch (error) {
      await removeFile("receipts", stored.publicId);
      throw error;
    }
    return orderResult(id);
  },
);

import type { Order, Receipt, TeacherUser } from "@/types/domain";
import type { Result } from "@/types/forms";
import { formatClassTime, formatDate, formatPKR, normalisePhone } from "@/lib/domain/format";
import { newId, newOrderNumber } from "@/lib/domain/ids";
import { enrolmentState, seatsLeft } from "@/lib/domain/orders";
import { commissionFor, findTeacherByCode, priceFor } from "@/lib/domain/pricing";
import { contactSchema, type ContactInput } from "@/lib/validation/checkout";
import { validateWith } from "@/lib/validation/validate";

import { fail, latency, nowIso, ok, read, replaceById, write } from "./client";
import { sendEmail } from "./mailer";
import { registerStudent, unregisterStudent } from "./meetings";

export interface ReceiptUpload {
  fileName: string;
  mimeType: string;
  url: string;
  transactionRef: string;
}

export interface CreateOrderInput {
  courseId: string;
  studentId: string | null;
  contact: ContactInput;
  promoCode: string | null;
  paymentMethodId: string;
  receipt: ReceiptUpload;
}

function teachers(): TeacherUser[] {
  return read().users.filter((user): user is TeacherUser => user.role === "teacher");
}

function toReceipt(upload: ReceiptUpload): Receipt {
  return {
    id: newId("rcp"),
    ...upload,
    transactionRef: upload.transactionRef.trim(),
    uploadedAt: nowIso(),
  };
}

export interface PromoPreview {
  code: string;
  teacherName: string;
  discountPct: number;
}

export async function checkPromoCode(code: string): Promise<Result<PromoPreview>> {
  await latency(250);
  const teacher = findTeacherByCode(teachers(), code);
  if (!teacher) return fail("That code isn't valid. Check with your teacher, or skip this step.");
  return ok({
    code: teacher.promoCode,
    teacherName: teacher.name,
    discountPct: teacher.discountPct,
  });
}

export async function createOrder(input: CreateOrderInput): Promise<Result<Order>> {
  await latency();
  const contact = await validateWith(contactSchema, input.contact);
  if (!contact.ok) return contact;
  const db = read();
  const course = db.courses.find(
    (candidate) => candidate.id === input.courseId && candidate.status === "published",
  );
  if (!course) return fail("This course is no longer available.");
  if (enrolmentState(course, db.orders) !== "open")
    return fail("Enrolment for this batch has closed.");
  const email = contact.data.email.toLowerCase();
  // Zoom allows one registrant per email, and students shouldn't pay twice for a class.
  if (
    db.orders.some(
      (order) =>
        order.courseId === course.id &&
        order.status !== "cancelled" &&
        order.contact.email.toLowerCase() === email,
    )
  )
    return fail("This email already has an order for this class. Check it on Track enrolment.");
  if (!db.paymentMethods.some((method) => method.id === input.paymentMethodId && method.enabled)) {
    return fail("Choose a payment method.");
  }

  const teacher = input.promoCode ? findTeacherByCode(teachers(), input.promoCode) : null;
  if (input.promoCode && !teacher)
    return fail("That promo code isn't valid any more. Remove it and try again.");

  const price = priceFor(course, teacher);
  const at = nowIso();
  const order: Order = {
    id: newOrderNumber(),
    courseId: course.id,
    studentId: input.studentId,
    contact: { ...contact.data, email },
    promoCode: teacher?.promoCode ?? null,
    price,
    commission: teacher
      ? {
          teacherId: teacher.id,
          pct: teacher.commissionPct,
          amount: commissionFor(price.total, teacher.commissionPct),
          payoutId: null,
        }
      : null,
    paymentMethodId: input.paymentMethodId,
    receipts: [toReceipt(input.receipt)],
    status: "pending",
    rejectionReason: null,
    history: [{ at, status: "pending" }],
    createdAt: at,
    updatedAt: at,
  };

  write((current) => ({ ...current, orders: [order, ...current.orders] }));
  sendEmail(
    "order_received",
    order.contact.email,
    `We received your payment for ${course.title}`,
    `Hi ${order.contact.name},\n\nOrder ${order.id} for ${course.title} (${formatPKR(price.total)}) is awaiting verification. Track it any time with your order number and phone.\n\n— Reallogixs Academy`,
  );
  return ok(order);
}

/** Guest lookup: both the order number and the phone on it must match. */
export async function lookupOrder(orderId: string, phone: string): Promise<Result<Order>> {
  await latency();
  const order = read().orders.find((candidate) => candidate.id === orderId.trim().toUpperCase());
  if (!order || normalisePhone(order.contact.phone) !== normalisePhone(phone)) {
    return fail("We couldn't find an order with that number and phone. Check both and try again.");
  }
  return ok(order);
}

export async function reuploadReceipt(
  orderId: string,
  upload: ReceiptUpload,
): Promise<Result<Order>> {
  await latency();
  const existing = read().orders.find((order) => order.id === orderId);
  if (!existing) return fail("Order not found.");
  if (existing.status !== "rejected") return fail("This order isn't waiting for a new receipt.");
  const at = nowIso();
  const updated: Order = {
    ...existing,
    receipts: [...existing.receipts, toReceipt(upload)],
    status: "pending",
    rejectionReason: null,
    history: [...existing.history, { at, status: "receipt_uploaded" }, { at, status: "pending" }],
    updatedAt: at,
  };
  write((db) => ({ ...db, orders: replaceById(db.orders, orderId, () => updated) }));
  return ok(updated);
}

export async function confirmOrder(orderId: string): Promise<Result<Order>> {
  await latency();
  const db = read();
  const order = db.orders.find((candidate) => candidate.id === orderId);
  const course = db.courses.find((candidate) => candidate.id === order?.courseId);
  if (!order || !course) return fail("Order not found.");
  if (order.status !== "pending")
    return fail("Only orders awaiting verification can be confirmed.");
  if (seatsLeft(course, db.orders) === 0)
    return fail("This batch is full. Increase the seats or contact the student.");

  // Register on Zoom first: an order is only confirmed if the student can actually get in.
  const registered = await registerStudent(order, course);
  if (!registered.ok) return registered;

  const at = nowIso();
  const updated: Order = {
    ...order,
    status: "confirmed",
    history: [...order.history, { at, status: "confirmed" }],
    updatedAt: at,
  };
  write((current) => ({ ...current, orders: replaceById(current.orders, orderId, () => updated) }));
  sendEmail(
    "order_confirmed",
    order.contact.email,
    `You're enrolled in ${course.title}`,
    `Hi ${order.contact.name},\n\nYour payment is confirmed. Join the Reallogixs WhatsApp community: ${db.content.community.whatsappUrl}\n\nClass: ${formatDate(course.startsAt)}, ${formatClassTime(course.startsAt, course.durationMinutes)}. Your personal Zoom link is in a separate email.\n\n— Reallogixs Academy`,
  );
  return ok(updated);
}

export async function rejectOrder(orderId: string, reason: string): Promise<Result<Order>> {
  await latency();
  const order = read().orders.find((candidate) => candidate.id === orderId);
  if (!order) return fail("Order not found.");
  if (order.status !== "pending") return fail("Only orders awaiting verification can be rejected.");
  const at = nowIso();
  const updated: Order = {
    ...order,
    status: "rejected",
    rejectionReason: reason.trim(),
    history: [...order.history, { at, status: "rejected", note: reason.trim() }],
    updatedAt: at,
  };
  write((db) => ({ ...db, orders: replaceById(db.orders, orderId, () => updated) }));
  sendEmail(
    "order_rejected",
    order.contact.email,
    `Action needed: order ${order.id}`,
    `Hi ${order.contact.name},\n\nWe couldn't verify your receipt: ${reason.trim()}\n\nUpload a new receipt from the Track enrolment page using order ${order.id} and your phone number.\n\n— Reallogixs Academy`,
  );
  return ok(updated);
}

export async function cancelOrder(orderId: string): Promise<Result> {
  await latency();
  const order = read().orders.find((candidate) => candidate.id === orderId);
  if (!order) return fail("Order not found.");
  if (order.commission?.payoutId) return fail("This order's commission has already been paid out.");
  if (read().certificates.some((item) => item.orderId === orderId && !item.revokedAt))
    return fail("This student has a certificate. Revoke it before cancelling the order.");
  await unregisterStudent(order);
  const at = nowIso();
  write((db) => ({
    ...db,
    orders: replaceById(db.orders, orderId, (current) => ({
      ...current,
      status: "cancelled",
      history: [...current.history, { at, status: "cancelled" }],
      updatedAt: at,
    })),
  }));
  return ok(undefined);
}

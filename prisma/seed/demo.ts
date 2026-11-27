// PLACEHOLDER: fictional people, orders and account numbers for development.
import { createSeed } from "../../src/mocks/seed";
import { normalisePhone } from "../../src/lib/domain/format";
import { hashPassword } from "../../src/server/core/password";
import type { PrismaClient } from "../../src/server/db/generated/client";

import { uuid } from "./ids";

const EVENT = {
  pending: "placed",
  receipt_uploaded: "receipt_uploaded",
  confirmed: "confirmed",
  rejected: "rejected",
  cancelled: "cancelled",
} as const;

export async function seedDemo(db: PrismaClient): Promise<void> {
  const seed = createSeed();
  if (await db.user.count()) {
    console.warn("Demo data skipped: this database already has users.");
    return;
  }

  // Hashed outside the transaction: each one is deliberately slow.
  const hashes = new Map<string, string>();
  for (const { password } of seed.users)
    if (!hashes.has(password)) hashes.set(password, await hashPassword(password));

  await db.$transaction(
    async (tx) => {
      for (const user of seed.users) {
        await tx.user.create({
          data: {
            id: uuid(user.id),
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            passwordHash: hashes.get(user.password),
            emailVerifiedAt: user.createdAt,
            active: user.role === "teacher" ? user.active : true,
            createdAt: user.createdAt,
            teacher:
              user.role === "teacher"
                ? {
                    create: {
                      promoCode: user.promoCode,
                      commissionPct: user.commissionPct,
                      discountPct: user.discountPct,
                    },
                  }
                : undefined,
          },
        });
      }
      await tx.siteStat.createMany({
        data: seed.content.stats.map((stat, position) => ({ ...stat, position })),
      });
      await tx.testimonial.createMany({
        data: seed.content.testimonials.map(({ name, role, quote, isPlaceholder }, position) => ({
          name,
          role,
          quote,
          isPlaceholder,
          position,
        })),
      });
      for (const method of seed.paymentMethods) {
        await tx.paymentMethod.update({
          where: { id: uuid(method.id) },
          data: {
            enabled: true,
            fields: {
              create: method.fields.map(({ label, value, copyable }, position) => ({
                label,
                value,
                copyable,
                position,
              })),
            },
          },
        });
      }
      await tx.instructor.createMany({
        data: seed.instructors.map((item) => ({ ...item, id: uuid(item.id) })),
      });
      for (const { id, categoryId, instructorId, bannerUrl, ...course } of seed.courses) {
        void bannerUrl;
        await tx.course.create({
          data: {
            ...course,
            id: uuid(id),
            categoryId: uuid(categoryId),
            instructorId: uuid(instructorId),
          },
        });
      }
      const teacherByCode = new Map(
        seed.users.flatMap((user) =>
          user.role === "teacher" ? [[user.promoCode, user.id] as const] : [],
        ),
      );
      for (const payout of seed.payouts) {
        await tx.payout.create({
          data: {
            id: uuid(payout.id),
            teacherId: uuid(payout.teacherId),
            amount: payout.amount,
            reference: payout.reference,
            paidAt: payout.paidAt,
            createdById: uuid("usr_admin"),
          },
        });
      }
      for (const order of seed.orders) {
        const teacherId = order.promoCode ? teacherByCode.get(order.promoCode) : undefined;
        await tx.order.create({
          data: {
            id: uuid(order.id),
            number: order.id,
            courseId: uuid(order.courseId),
            studentId: order.studentId && uuid(order.studentId),
            contactName: order.contact.name,
            contactEmail: order.contact.email,
            contactPhone: order.contact.phone,
            phoneKey: normalisePhone(order.contact.phone),
            teacherId: teacherId && uuid(teacherId),
            promoCode: teacherId ? order.promoCode : null,
            priceBase: order.price.base,
            discountPct: order.price.discountPct,
            discount: order.price.discount,
            total: order.price.total,
            paymentMethodId: uuid(order.paymentMethodId),
            status: order.status,
            rejectionReason: order.rejectionReason,
            confirmedAt: order.history.find((event) => event.status === "confirmed")?.at,
            createdAt: order.createdAt,
            receipts: {
              create: order.receipts.map((receipt) => ({
                publicId: `demo/${receipt.id}`,
                fileName: receipt.fileName,
                mimeType: receipt.mimeType,
                bytes: 1,
                transactionRef: receipt.transactionRef,
                createdAt: receipt.uploadedAt,
              })),
            },
            events: {
              create: order.history.map((event) => ({
                type: EVENT[event.status],
                note: event.note,
                createdAt: event.at,
              })),
            },
            commission: order.commission
              ? {
                  create: {
                    teacherId: uuid(order.commission.teacherId),
                    pct: order.commission.pct,
                    amount: order.commission.amount,
                    payoutId: order.commission.payoutId && uuid(order.commission.payoutId),
                  },
                }
              : undefined,
          },
        });
      }
      for (const { courseId, registrants, attendance, denied, ...meeting } of seed.meetings) {
        await tx.meeting.create({
          data: {
            ...meeting,
            courseId: uuid(courseId),
            registrants: {
              create: registrants.map((item) => ({
                orderId: uuid(item.orderId),
                email: item.email,
                joinToken: item.joinToken,
                createdAt: item.registeredAt,
                attendance: {
                  create: attendance
                    .filter((session) => session.orderId === item.orderId)
                    .map(({ joinedAt, leftAt }) => ({ joinedAt, leftAt })),
                },
              })),
            },
            refusals: {
              create: denied.map(({ at, email, reason }) => ({ email, reason, createdAt: at })),
            },
          },
        });
      }
      for (const { id, orderId, courseId, ...certificate } of seed.certificates) {
        void courseId;
        await tx.certificate.create({
          data: { ...certificate, id: uuid(id), orderId: uuid(orderId) },
        });
      }
    },
    { timeout: 120_000 },
  );
}

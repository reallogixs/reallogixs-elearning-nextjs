"use server";

import { after } from "next/server";

import { formatPKR } from "@/lib/domain/format";
import { payTeacherSchema } from "@/lib/validation/admin";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { ActionError } from "@/server/core/errors";
import { lockDueCommissions } from "@/server/core/locks";
import { db } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { payoutSent } from "@/server/email/templates";

/** Records one payout for every commission due. Refused if the total is no longer what was shown. */
export const payTeacher = roleAction(
  "pay-teacher",
  "admin",
  payTeacherSchema,
  async ({ teacherId, reference, expectedAmount }, admin): Promise<void> => {
    const paid = await db().$transaction(async (tx) => {
      const teacher = await tx.teacherProfile.findUnique({
        where: { userId: teacherId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (!teacher) throw new ActionError("Teacher not found.");
      const due = await lockDueCommissions(tx, teacherId);
      const amount = due.reduce((sum, row) => sum + row.amount, 0);
      if (!amount) throw new ActionError("Nothing is due for this teacher.");
      if (amount !== expectedAmount)
        throw new ActionError(
          `The amount due is now ${formatPKR(amount)}. Check it and try again.`,
        );
      const payout = await tx.payout.create({
        data: { teacherId, amount, reference, createdById: admin.id },
      });
      await tx.commission.updateMany({
        where: { orderId: { in: due.map((row) => row.order_id) } },
        data: { payoutId: payout.id },
      });
      await audit(tx, admin.id, "payout.create", "payout", payout.id, { amount });
      return { id: payout.id, amount, referrals: due.length, ...teacher.user };
    });
    after(() =>
      sendMail(
        paid.email,
        payoutSent(paid.name, {
          amount: formatPKR(paid.amount),
          referrals: paid.referrals,
          reference,
        }),
        paid.id,
      ),
    );
  },
);

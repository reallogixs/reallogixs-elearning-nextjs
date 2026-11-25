"use server";

import { LOGIN_PATH } from "@/lib/account/loginPath";
import { newPromoCode } from "@/lib/domain/ids";
import {
  teacherActiveSchema,
  idSchema,
  teacherSchema,
  updateTeacherSchema,
} from "@/lib/validation/admin";
import { createPasswordLink } from "@/server/core/accountTokens";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { siteUrl } from "@/server/core/env";
import { ActionError } from "@/server/core/errors";
import { db, type Tx } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { teacherInvite } from "@/server/email/templates";

const NOT_SENT =
  "Saved, but the email couldn't be sent. Check the email settings and send it again.";

async function assertFree(
  client: Tx,
  { email, promoCode }: { email: string; promoCode: string },
  exceptId?: string,
): Promise<void> {
  const not = exceptId ? { not: exceptId } : undefined;
  if (await client.user.findFirst({ where: { email, id: not } }))
    throw new ActionError("Someone already uses this email.");
  if (promoCode && (await client.teacherProfile.findFirst({ where: { promoCode, userId: not } })))
    throw new ActionError("Another teacher already has this code.");
}

async function freeCode(client: Tx, name: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const promoCode = newPromoCode(name);
    if (!(await client.teacherProfile.findUnique({ where: { promoCode } }))) return promoCode;
  }
  throw new ActionError("Couldn't make a promo code. Please type one.");
}

async function findTeacher(client: Tx, id: string) {
  const user = await client.user.findFirst({
    where: { id, role: "teacher", archivedAt: null },
    include: { teacher: true },
  });
  if (!user?.teacher) throw new ActionError("Teacher not found.");
  return { ...user, teacher: user.teacher };
}

/** Emails a fresh one-time link. Returns whether it was sent. */
async function invite(id: string): Promise<boolean> {
  const client = db();
  const user = await findTeacher(client, id);
  const url = await createPasswordLink(client, id, "set_password");
  const discount = user.teacher.discountPct.toNumber();
  const rates = `You earn ${user.teacher.commissionPct.toString()}% of every confirmed enrolment made with it${
    discount ? `, and your students save ${discount}%` : ""
  }.`;
  return sendMail(
    user.email,
    teacherInvite(user.name, url, user.teacher.promoCode, rates, siteUrl(LOGIN_PATH.teacher)),
    id,
  );
}

/** Only admins create teachers, who choose their own password from the emailed link. */
export const createTeacher = roleAction(
  "create-teacher",
  "admin",
  teacherSchema,
  async (input, admin): Promise<{ notice: string }> => {
    const email = input.email.toLowerCase();
    const user = await db().$transaction(async (tx) => {
      await assertFree(tx, { email, promoCode: input.promoCode });
      const promoCode = input.promoCode || (await freeCode(tx, input.name));
      const created = await tx.user.create({
        data: {
          role: "teacher",
          name: input.name,
          email,
          phone: input.phone,
          teacher: {
            create: {
              promoCode,
              commissionPct: input.commissionPct,
              discountPct: input.discountPct,
            },
          },
        },
      });
      await audit(tx, admin.id, "teacher.create", "user", created.id);
      return created;
    });
    return { notice: (await invite(user.id)) ? "Teacher added and invited by email." : NOT_SENT };
  },
);

/** New rates apply to future sales only: orders keep the rate they were placed with. */
export const updateTeacher = roleAction(
  "update-teacher",
  "admin",
  updateTeacherSchema,
  async (input, admin): Promise<void> => {
    const email = input.email.toLowerCase();
    await db().$transaction(async (tx) => {
      const before = await findTeacher(tx, input.id);
      await assertFree(tx, { email, promoCode: input.promoCode }, input.id);
      const promoCode = input.promoCode || before.teacher.promoCode;
      const emailChanged = email !== before.email;
      await tx.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email,
          phone: input.phone,
          ...(emailChanged ? { emailVerifiedAt: null } : {}),
          teacher: {
            update: {
              promoCode,
              commissionPct: input.commissionPct,
              discountPct: input.discountPct,
            },
          },
        },
      });
      if (emailChanged) {
        await tx.session.deleteMany({ where: { userId: input.id } });
        await tx.authToken.deleteMany({ where: { userId: input.id } });
      }
      await audit(tx, admin.id, "teacher.update", "user", input.id, {
        emailChanged,
        codeChanged: promoCode !== before.teacher.promoCode,
        commissionPct: input.commissionPct,
        discountPct: input.discountPct,
      });
    });
  },
);

/** Pausing signs the teacher out at once and stops their code and links. */
export const setTeacherActive = roleAction(
  "teacher-active",
  "admin",
  teacherActiveSchema,
  async ({ id, active }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      await findTeacher(tx, id);
      await tx.user.update({ where: { id }, data: { active } });
      if (!active) {
        await tx.session.deleteMany({ where: { userId: id } });
        await tx.authToken.deleteMany({ where: { userId: id } });
      }
      await audit(tx, admin.id, active ? "teacher.activate" : "teacher.pause", "user", id);
    });
  },
);

export const sendTeacherLink = roleAction(
  "teacher-link",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<{ notice: string }> => {
    const user = await findTeacher(db(), id);
    if (!user.active) throw new ActionError("Activate this teacher first.");
    await audit(db(), admin.id, "teacher.send_link", "user", id);
    return { notice: (await invite(id)) ? "Password link emailed." : NOT_SENT };
  },
);

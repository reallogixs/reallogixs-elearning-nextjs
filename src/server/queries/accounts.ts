import "server-only";

import type { Account, TeacherAccount } from "@/types/account";
import type { SessionUser } from "@/server/core/session";
import { db } from "@/server/db";

/** What the browser may know about the signed-in user. */
export async function toAccount(user: SessionUser): Promise<Account> {
  if (user.role !== "teacher") return { ...user, teacher: null };
  const profile = await db().teacherProfile.findUnique({ where: { userId: user.id } });
  return {
    ...user,
    teacher: profile && {
      promoCode: profile.promoCode,
      commissionPct: profile.commissionPct.toNumber(),
      discountPct: profile.discountPct.toNumber(),
    },
  };
}

/** Admin only: the page that calls this checks the role. */
export async function listTeacherAccounts(): Promise<TeacherAccount[]> {
  const users = await db().user.findMany({
    where: { role: "teacher", archivedAt: null },
    include: { teacher: true },
    orderBy: { createdAt: "asc" },
  });
  return users.flatMap(({ teacher, ...user }) =>
    teacher
      ? [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            active: user.active,
            invited: !user.passwordHash,
            createdAt: user.createdAt.toISOString(),
            promoCode: teacher.promoCode,
            commissionPct: teacher.commissionPct.toNumber(),
            discountPct: teacher.discountPct.toNumber(),
          },
        ]
      : [],
  );
}

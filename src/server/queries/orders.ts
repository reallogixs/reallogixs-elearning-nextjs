import "server-only";

import type { Meeting, Payout, StudentUser, TeacherUser } from "@/types/domain";
import type { OrderResult, PortalData } from "@/types/portal";
import { db } from "@/server/db";

import { listTeacherAccounts } from "./accounts";
import {
  fillMeetings,
  loadOrders,
  toAdminOrder,
  toMeeting,
  toPortalData,
  toStudentOrder,
  toTeacherOrder,
} from "./orderShape";
import { getCatalogue } from "./catalogue";
import { listPaymentMethods } from "./payments";

async function listPayouts(teacherId?: string): Promise<Payout[]> {
  const payouts = await db().payout.findMany({
    where: { teacherId },
    include: { commissions: { select: { order: { select: { number: true } } } } },
    orderBy: { paidAt: "desc" },
  });
  return payouts.map((payout) => ({
    id: payout.id,
    teacherId: payout.teacherId,
    amount: payout.amount,
    orderIds: payout.commissions.map(({ order }) => order.number),
    reference: payout.reference,
    paidAt: payout.paidAt.toISOString(),
  }));
}

async function listStudents(): Promise<StudentUser[]> {
  const users = await db().user.findMany({
    where: { role: "student", archivedAt: null },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return users.map((user) => ({
    ...user,
    role: "student",
    createdAt: user.createdAt.toISOString(),
  }));
}

const REFUSALS_SHOWN = 100;

async function listMeetings(): Promise<Meeting[]> {
  const meetings = await db().meeting.findMany({
    include: { refusals: { orderBy: { createdAt: "desc" }, take: REFUSALS_SHOWN } },
  });
  return meetings.map(({ refusals, ...meeting }) => ({
    ...toMeeting(meeting),
    denied: refusals.map(({ createdAt, email, reason }) => ({
      at: createdAt.toISOString(),
      email,
      reason,
    })),
  }));
}

/** Everything. Only for pages that checked the admin role. */
export async function adminData(): Promise<PortalData> {
  const [rows, methods, payouts, students, teachers, meetings, catalogue] = await Promise.all([
    loadOrders({}),
    listPaymentMethods({ enabledOnly: false }),
    listPayouts(),
    listStudents(),
    listTeacherAccounts(),
    listMeetings(),
    getCatalogue(),
  ]);
  const live = toPortalData(rows, toAdminOrder);
  const known = new Set([...methods, ...catalogue.courses].map(({ id }) => id));
  return {
    ...live,
    courses: [...catalogue.courses, ...live.courses.filter(({ id }) => !known.has(id))],
    meetings: fillMeetings(meetings, rows),
    paymentMethods: [...methods, ...live.paymentMethods.filter(({ id }) => !known.has(id))],
    payouts,
    users: [
      ...students,
      ...teachers.map(({ invited, ...account }): TeacherUser => {
        void invited;
        return { ...account, role: "teacher" };
      }),
    ],
  };
}

export async function teacherData(teacherId: string): Promise<PortalData> {
  const [rows, payouts] = await Promise.all([loadOrders({ teacherId }), listPayouts(teacherId)]);
  return {
    ...toPortalData(rows, toTeacherOrder),
    payouts,
    meetings: [],
    certificates: [],
    paymentMethods: [],
  };
}

/** Their own orders, and guest orders placed with the email they proved is theirs. */
export async function studentData(user: { id: string; email: string }): Promise<PortalData> {
  const rows = await loadOrders({
    OR: [{ studentId: user.id }, { studentId: null, contactEmail: user.email }],
  });
  return toPortalData(rows, (row) => ({ ...toStudentOrder(row), studentId: user.id }));
}

/** One order for whoever just placed it or proved it is theirs. */
export async function orderResult(id: string): Promise<OrderResult> {
  const rows = await loadOrders({ id });
  return { number: rows[0]?.number ?? "", data: toPortalData(rows, toStudentOrder) };
}

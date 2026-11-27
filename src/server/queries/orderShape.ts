import "server-only";

import type { CatalogueCourse } from "@/types/catalogue";
import type { Certificate, Meeting, Order, OrderEvent, PaymentMethod } from "@/types/domain";
import type { PortalData } from "@/types/portal";
import { db } from "@/server/db";
import { fileUrl } from "@/server/files/storage";
import type { Prisma } from "@/server/db/generated/client";

export const ORDER_INCLUDE = {
  course: {
    omit: { description: true, outcomes: true },
    include: { meeting: true },
  },
  paymentMethod: { select: { id: true, name: true, position: true } },
  receipts: { orderBy: { createdAt: "asc" } },
  events: { orderBy: { createdAt: "asc" } },
  commission: true,
  registrant: { include: { attendance: true }, orderBy: { createdAt: "asc" } },
  certificate: true,
} satisfies Prisma.OrderInclude;

export type OrderRow = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

export function loadOrders(where: Prisma.OrderWhereInput): Promise<OrderRow[]> {
  return db().order.findMany({ where, include: ORDER_INCLUDE, orderBy: { createdAt: "desc" } });
}

function toEvent(event: OrderRow["events"][number]): OrderEvent {
  return {
    at: event.createdAt.toISOString(),
    status: event.type === "placed" ? "pending" : event.type,
    ...(event.note ? { note: event.note } : {}),
  };
}

/** The full record. Only admins get this; others get the narrower ones below. */
export function toAdminOrder(row: OrderRow): Order {
  return {
    id: row.number,
    courseId: row.courseId,
    studentId: row.studentId,
    contact: { name: row.contactName, email: row.contactEmail, phone: row.contactPhone },
    promoCode: row.promoCode,
    price: {
      base: row.priceBase,
      discountPct: row.discountPct.toNumber(),
      discount: row.discount,
      total: row.total,
    },
    commission: row.commission && {
      teacherId: row.commission.teacherId,
      pct: row.commission.pct.toNumber(),
      amount: row.commission.amount,
      payoutId: row.commission.payoutId,
    },
    paymentMethodId: row.paymentMethodId,
    receipts: row.receipts.map((receipt) => ({
      id: receipt.id,
      fileName: receipt.fileName,
      mimeType: receipt.mimeType,
      url: `/api/receipts/${receipt.id}`,
      transactionRef: receipt.transactionRef,
      uploadedAt: receipt.createdAt.toISOString(),
    })),
    status: row.status,
    rejectionReason: row.rejectionReason,
    history: row.events.map(toEvent),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** For the student: no receipts or commission. */
export function toStudentOrder(row: OrderRow): Order {
  return { ...toAdminOrder(row), receipts: [], commission: null };
}

/** For the referring teacher: the student's name, course, status and commission only. */
export function toTeacherOrder(row: OrderRow): Order {
  return {
    ...toAdminOrder(row),
    studentId: null,
    contact: { name: row.contactName, email: "", phone: "" },
    price: { base: 0, discountPct: 0, discount: 0, total: 0 },
    receipts: [],
    paymentMethodId: "",
    rejectionReason: null,
    history: row.events.map((event) => ({ ...toEvent(event), note: undefined })),
  };
}

function toCourse({ course }: OrderRow): CatalogueCourse {
  const { meeting, archivedAt, updatedAt, startsAt, createdAt, bannerPublicId, ...rest } = course;
  void updatedAt;
  return {
    ...rest,
    bannerUrl: fileUrl("banners", bannerPublicId),
    status: archivedAt ? "draft" : rest.status,
    startsAt: startsAt.toISOString(),
    createdAt: createdAt.toISOString(),
    seatsTaken: 0,
    meetingStatus: meeting?.status ?? "scheduled",
    completed: Boolean(meeting?.completedAt),
  };
}

function toMethod({ paymentMethod }: OrderRow): PaymentMethod {
  const { id, name, position } = paymentMethod;
  return { id, name, order: position, logoUrl: null, fields: [], instructions: "", enabled: false };
}

function unique<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

type MeetingRow = NonNullable<OrderRow["course"]["meeting"]>;

export function toMeeting(row: MeetingRow): Meeting {
  return {
    courseId: row.courseId,
    zoomId: row.zoomId,
    status: row.status,
    startedAt: row.startedAt?.toISOString() ?? null,
    endedAt: row.endedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    registrants: [],
    attendance: [],
    denied: [],
  };
}

/** Puts the orders' students and attendance on their meetings. Past links keep their attendance. */
export function fillMeetings(meetings: Meeting[], rows: OrderRow[]): Meeting[] {
  return meetings.map((meeting) => {
    const mine = rows.filter((row) => row.courseId === meeting.courseId);
    return {
      ...meeting,
      registrants: mine.flatMap((row) =>
        row.registrant
          .filter((item) => !item.revokedAt)
          .map((item) => ({
            orderId: row.number,
            name: row.contactName,
            email: item.email,
            joinToken: item.joinToken,
            registeredAt: item.createdAt.toISOString(),
          })),
      ),
      attendance: mine.flatMap((row) =>
        row.registrant.flatMap((item) =>
          item.attendance.map((stay) => ({
            orderId: row.number,
            joinedAt: stay.joinedAt.toISOString(),
            leftAt: stay.leftAt?.toISOString() ?? null,
          })),
        ),
      ),
    };
  });
}

type CertificateRow = NonNullable<OrderRow["certificate"]>;

export function toCertificate(
  row: CertificateRow,
  order: { number: string; courseId: string },
): Certificate {
  return {
    id: row.id,
    code: row.code,
    orderId: order.number,
    courseId: order.courseId,
    studentName: row.studentName,
    courseTitle: row.courseTitle,
    issuedAt: row.issuedAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
  };
}

/** Everything the rows hold, in the viewer's shape. Meetings here are without refusals. */
export function toPortalData(rows: OrderRow[], shape: (row: OrderRow) => Order): PortalData {
  const meetings = unique(
    rows.flatMap(({ course }) => (course.meeting ? [course.meeting] : [])),
  ).map(toMeeting);
  return {
    orders: rows.map(shape),
    courses: unique(rows.map(toCourse)),
    paymentMethods: unique(rows.map(toMethod)),
    users: [],
    payouts: [],
    meetings: fillMeetings(meetings, rows),
    certificates: rows.flatMap((row) =>
      row.certificate ? [toCertificate(row.certificate, row)] : [],
    ),
  };
}

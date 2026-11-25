import type { PortalData } from "@/types/portal";
import { confirmedAt, periodChange, weeklySeries, type SeriesPoint } from "@/lib/domain/analytics";
import { seatsTaken } from "@/lib/domain/orders";
import { teacherSummary, teachers } from "@/lib/portal/selectors";

export const WEEKS = 12;

export interface AdminMetrics {
  revenue: SeriesPoint[];
  enrolments: SeriesPoint[];
  revenueTotal: number;
  enrolmentTotal: number;
  revenueChange: number | null;
  enrolmentChange: number | null;
  pendingCount: number;
  commissionDue: number;
  statusCounts: Record<"confirmed" | "pending" | "rejected" | "cancelled", number>;
  seats: { label: string; value: number; max: number }[];
  topTeachers: { id: string; name: string; confirmed: number; earned: number }[];
}

/** Everything the admin dashboard shows, from one database snapshot. */
export function adminMetrics(db: PortalData, now: Date): AdminMetrics {
  const revenue = weeklySeries(
    db.orders,
    now,
    WEEKS,
    (order) => (order.status === "confirmed" ? confirmedAt(order) : null),
    (order) => order.price.total,
  );
  const enrolments = weeklySeries(
    db.orders,
    now,
    WEEKS,
    (order) => (order.status === "confirmed" ? confirmedAt(order) : null),
    () => 1,
  );
  const sum = (points: SeriesPoint[]): number =>
    points.reduce((total, point) => total + point.value, 0);
  const count = (status: keyof AdminMetrics["statusCounts"]): number =>
    db.orders.filter((order) => order.status === status).length;
  const teacherRows = teachers(db).map((teacher) => ({
    teacher,
    summary: teacherSummary(db, teacher.id),
  }));

  return {
    revenue,
    enrolments,
    revenueTotal: sum(revenue),
    enrolmentTotal: sum(enrolments),
    revenueChange: periodChange(revenue, 4),
    enrolmentChange: periodChange(enrolments, 4),
    pendingCount: count("pending"),
    commissionDue: teacherRows.reduce((total, row) => total + row.summary.due, 0),
    statusCounts: {
      confirmed: count("confirmed"),
      pending: count("pending"),
      rejected: count("rejected"),
      cancelled: count("cancelled"),
    },
    seats: db.courses
      .filter((course) => course.status === "published")
      .map((course) => ({
        label: course.title,
        value: seatsTaken(db.orders, course.id),
        max: course.seats,
      }))
      .sort((a, b) => b.value / b.max - a.value / a.max),
    topTeachers: teacherRows
      .filter((row) => row.summary.confirmed > 0)
      .sort((a, b) => b.summary.earned - a.summary.earned)
      .map((row) => ({
        id: row.teacher.id,
        name: row.teacher.name,
        confirmed: row.summary.confirmed,
        earned: row.summary.earned,
      })),
  };
}

import type { Course, Database, SiteContent } from "@/types/domain";
import { demoMeeting } from "@/mocks/meetings";
import { createSeed, DB_VERSION } from "@/mocks/seed";

import { OUTDATED_COPY } from "./outdatedCopy";

/** Version 2 courses ran for weeks; version 3 courses are single online masterclasses. */
type CourseV2 = Omit<Course, "startsAt" | "durationMinutes"> & { startDate: string };
type DatabaseV2 = Omit<Database, "courses" | "meetings" | "certificates"> & {
  courses: CourseV2[];
  certificates: Omit<Database["certificates"][number], "courseId" | "revokedAt">[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Saved values win; any field added since they were saved is filled from the defaults. */
function withDefaults<T>(defaults: T, saved: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(saved)) return (saved ?? defaults) as T;
  const merged: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(saved)) {
    merged[key] =
      key in defaults ? withDefaults((defaults as Record<string, unknown>)[key], value) : value;
  }
  return merged as T;
}

/** Swaps only default wording that no longer applies; anything the admin wrote is kept. */
function refreshCopy(content: SiteContent): SiteContent {
  return OUTDATED_COPY.reduce<SiteContent>((current, [from, to]) => {
    const quoted = (text: string): string => JSON.stringify(text).slice(1, -1);
    return JSON.parse(JSON.stringify(current).replaceAll(quoted(from), quoted(to))) as SiteContent;
  }, content);
}

function fromV2(old: DatabaseV2): Database {
  const seed = createSeed();
  const upgraded = old.courses.map((course): Course => {
    const { startDate, ...rest } = course;
    const seeded = seed.courses.find((item) => item.id === course.id);
    return {
      ...rest,
      mode: "online",
      venue: "Live on Zoom",
      startsAt: seeded?.startsAt ?? `${startDate}T20:00:00+05:00`,
      durationMinutes: seeded?.durationMinutes ?? 120,
    };
  });
  const savedIds = new Set(old.courses.map((course) => course.id));
  const demoCourses = seed.courses.filter(
    (course) => course.id === "crs_prompt" && !savedIds.has(course.id),
  );
  const demoIds = new Set(demoCourses.map((course) => course.id));
  const demoOrders = seed.orders.filter((order) => demoIds.has(order.courseId));
  const courses = [...upgraded, ...demoCourses];
  const orders = [...old.orders, ...demoOrders];
  return {
    ...old,
    version: DB_VERSION,
    courses,
    orders,
    meetings: courses.map(
      (course) =>
        (demoIds.has(course.id) &&
          seed.meetings.find((meeting) => meeting.courseId === course.id)) ||
        demoMeeting(course, orders),
    ),
    certificates: [
      ...seed.certificates.filter((item) => demoIds.has(item.courseId)),
      ...old.certificates.map((item) => ({
        ...item,
        courseId: orders.find((order) => order.id === item.orderId)?.courseId ?? "",
        revokedAt: null,
      })),
    ],
    content: refreshCopy(old.content),
  };
}

/** Brings saved demo data up to the current shape, or returns null to start from the seed. */
export function upgradeDatabase(raw: unknown): Database | null {
  if (!isPlainObject(raw)) return null;
  const current =
    raw.version === DB_VERSION
      ? (raw as unknown as Database)
      : raw.version === 2
        ? fromV2(raw as unknown as DatabaseV2)
        : null;
  return current && { ...current, content: withDefaults(createSeed().content, current.content) };
}

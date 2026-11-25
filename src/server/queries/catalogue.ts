import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { Catalogue, CatalogueCourse } from "@/types/catalogue";
import type { Course } from "@/types/domain";
import { TAG } from "@/server/core/tags";
import { db } from "@/server/db";

async function load(): Promise<Catalogue> {
  const client = db();
  const [courses, categories, instructors] = await Promise.all([
    client.course.findMany({
      where: { archivedAt: null },
      omit: { description: true, outcomes: true },
      include: {
        meeting: { select: { status: true, completedAt: true } },
        _count: { select: { orders: { where: { status: "confirmed" } } } },
      },
      orderBy: { startsAt: "asc" },
    }),
    client.category.findMany({ where: { archivedAt: null }, orderBy: { position: "asc" } }),
    client.instructor.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" } }),
  ]);
  return {
    courses: courses.map(
      ({
        meeting,
        _count,
        archivedAt,
        updatedAt,
        startsAt,
        createdAt,
        ...course
      }): CatalogueCourse => {
        void [archivedAt, updatedAt];
        return {
          ...course,
          startsAt: startsAt.toISOString(),
          createdAt: createdAt.toISOString(),
          seatsTaken: _count.orders,
          meetingStatus: meeting?.status ?? "scheduled",
          completed: Boolean(meeting?.completedAt),
        };
      },
    ),
    categories: categories.map(({ id, name, slug, description, parentId, position }) => ({
      id,
      name,
      slug,
      description,
      parentId,
      order: position,
    })),
    instructors: instructors.map(({ id, name, title, bio }) => ({ id, name, title, bio })),
  };
}

/** Everything, drafts included: for admin pages only. */
export const getCatalogue = cache(
  unstable_cache(load, ["catalogue"], { tags: [TAG.catalogue], revalidate: 60 }),
);

/** What visitors may see: published courses that haven't been held yet. */
export async function getPublicCatalogue(): Promise<Catalogue> {
  const catalogue = await getCatalogue();
  return {
    ...catalogue,
    courses: catalogue.courses.filter(
      (course) => course.status === "published" && !course.completed,
    ),
  };
}

export type CourseText = Pick<Course, "description" | "outcomes">;

/** The long text of one course. */
export const getCourseText = cache(async (id: string): Promise<CourseText | null> => {
  const read = unstable_cache(
    () => db().course.findUnique({ where: { id }, select: { description: true, outcomes: true } }),
    ["course-text", id],
    { tags: [TAG.catalogue] },
  );
  return read();
});

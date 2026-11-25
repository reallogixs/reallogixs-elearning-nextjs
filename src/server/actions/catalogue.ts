"use server";

import { updateTag } from "next/cache";

import { descendantIds } from "@/lib/domain/categories";
import { fromPktInput } from "@/lib/domain/format";
import {
  idSchema,
  moveSchema,
  saveCategorySchema,
  saveCourseSchema,
  saveInstructorSchema,
  setEnrolmentSchema,
} from "@/lib/validation/admin";
import * as zoom from "@/lib/zoom/client";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { ActionError } from "@/server/core/errors";
import { TAG } from "@/server/core/tags";
import { db, type Tx } from "@/server/db";

/** Frees the slug for reuse while the archived record keeps its history. */
function archivedSlug(slug: string, id: string): string {
  return `${slug}-archived-${id}`;
}

async function assertSlugFree(
  client: Tx,
  model: "course" | "category",
  slug: string,
  id: string,
): Promise<void> {
  const where = { slug, ...(id ? { id: { not: id } } : {}) };
  const taken =
    model === "course"
      ? await client.course.findFirst({ where, select: { id: true } })
      : await client.category.findFirst({ where, select: { id: true } });
  if (taken) throw new ActionError(`Another ${model} already uses this slug.`);
}

/* Courses ---------------------------------------------------------------- */

export const saveCourse = roleAction(
  "save-course",
  "admin",
  saveCourseSchema,
  async ({ id, ...values }, admin): Promise<void> => {
    const startsAt = new Date(fromPktInput(values.startsAt));
    if (Number.isNaN(startsAt.getTime())) throw new ActionError("Pick a real date and time.");
    const data = {
      ...values,
      startsAt,
      outcomes: values.outcomes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
    // Outside the transaction: it talks to Zoom.
    const created = id ? null : await zoom.createMeeting();

    const zoomId = await db().$transaction(async (tx) => {
      await assertSlugFree(tx, "course", values.slug, id);
      const [category, instructor] = await Promise.all([
        tx.category.findFirst({ where: { id: values.categoryId, archivedAt: null } }),
        tx.instructor.findFirst({ where: { id: values.instructorId, archivedAt: null } }),
      ]);
      if (!category) throw new ActionError("That category no longer exists.");
      if (!instructor) throw new ActionError("That instructor no longer exists.");

      if (created) {
        const course = await tx.course.create({
          data: { ...data, meeting: { create: { zoomId: created.zoomId } } },
        });
        await audit(tx, admin.id, "course.create", "course", course.id);
        return null;
      }
      const before = await tx.course.findFirst({
        where: { id, archivedAt: null },
        include: {
          meeting: true,
          _count: { select: { orders: { where: { status: "confirmed" } } } },
        },
      });
      if (!before) throw new ActionError("Course not found.");
      const held = before.meeting !== null && before.meeting.status !== "scheduled";
      if (held && before.startsAt.getTime() !== startsAt.getTime())
        throw new ActionError("This class has already been held, so its date can't change.");
      if (values.seats < before._count.orders)
        throw new ActionError(`${before._count.orders} students are already confirmed.`);
      await tx.course.update({
        where: { id },
        data: { ...data, enrolmentOpen: held ? false : values.enrolmentOpen },
      });
      await audit(tx, admin.id, "course.update", "course", id);
      return before.meeting?.zoomId ?? null;
    });
    if (zoomId) await zoom.updateMeeting(zoomId, { title: values.title });
    updateTag(TAG.catalogue);
  },
);

/** Deletes an unused course. One with orders is archived, so its history stays correct. */
export const removeCourse = roleAction(
  "remove-course",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<{ notice: string }> => {
    const result = await db().$transaction(async (tx) => {
      const course = await tx.course.findFirst({
        where: { id, archivedAt: null },
        include: { meeting: true, _count: { select: { orders: true } } },
      });
      if (!course) throw new ActionError("Course not found.");
      const waiting = await tx.order.count({
        where: { courseId: id, status: { in: ["pending", "confirmed"] } },
      });
      if (waiting && !course.meeting?.completedAt)
        throw new ActionError(
          "Students have paid for this class and it isn't completed. Cancel their orders or complete the class first.",
        );
      if (course._count.orders) {
        await tx.course.update({
          where: { id },
          data: {
            archivedAt: new Date(),
            slug: archivedSlug(course.slug, id),
            enrolmentOpen: false,
            featured: false,
          },
        });
        await audit(tx, admin.id, "course.archive", "course", id);
        return { notice: "Course archived. Its orders are kept.", zoomId: null };
      }
      await tx.course.delete({ where: { id } });
      await audit(tx, admin.id, "course.delete", "course", id);
      return { notice: "Course deleted.", zoomId: course.meeting?.zoomId ?? null };
    });
    if (result.zoomId) await zoom.deleteMeeting(result.zoomId);
    updateTag(TAG.catalogue);
    return { notice: result.notice };
  },
);

export const setEnrolmentOpen = roleAction(
  "course-enrolment",
  "admin",
  setEnrolmentSchema,
  async ({ id, open }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const course = await tx.course.findFirst({
        where: { id, archivedAt: null },
        include: { meeting: true },
      });
      if (!course) throw new ActionError("Course not found.");
      if (open && course.meeting && course.meeting.status !== "scheduled")
        throw new ActionError("This class has already been held.");
      await tx.course.update({ where: { id }, data: { enrolmentOpen: open } });
      await audit(tx, admin.id, "course.enrolment", "course", id, { open });
    });
    updateTag(TAG.catalogue);
  },
);

/* Categories (any depth) ------------------------------------------------- */

export const saveCategory = roleAction(
  "save-category",
  "admin",
  saveCategorySchema,
  async ({ id, ...values }, admin): Promise<void> => {
    const parentId = values.parentId || null;
    await db().$transaction(async (tx) => {
      await assertSlugFree(tx, "category", values.slug, id);
      const rows = await tx.category.findMany({ where: { archivedAt: null } });
      const before = rows.find((row) => row.id === id);
      if (id && !before) throw new ActionError("Category not found.");
      if (parentId && !rows.some((row) => row.id === parentId))
        throw new ActionError("That parent category no longer exists.");
      const tree = rows.map((row) => ({ ...row, order: row.position }));
      if (id && parentId && descendantIds(tree, id).has(parentId))
        throw new ActionError("A category can't sit inside itself or one of its sub-categories.");

      const siblings = rows.filter((row) => row.parentId === parentId && row.id !== id);
      const last = Math.max(0, ...siblings.map((row) => row.position));
      const data = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parentId,
        position: before && before.parentId === parentId ? before.position : last + 1,
      };
      const saved = id
        ? await tx.category.update({ where: { id }, data })
        : await tx.category.create({ data });
      await audit(tx, admin.id, id ? "category.update" : "category.create", "category", saved.id);
    });
    updateTag(TAG.catalogue);
  },
);

export const removeCategory = roleAction(
  "remove-category",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const category = await tx.category.findFirst({
        where: { id, archivedAt: null },
        include: {
          children: { select: { archivedAt: true } },
          courses: { select: { archivedAt: true } },
        },
      });
      if (!category) throw new ActionError("Category not found.");
      if (category.children.some((child) => !child.archivedAt))
        throw new ActionError("Move or delete its sub-categories first.");
      if (category.courses.some((course) => !course.archivedAt))
        throw new ActionError("Some courses use this category. Move them first.");
      const used = category.children.length > 0 || category.courses.length > 0;
      if (used)
        await tx.category.update({
          where: { id },
          data: { archivedAt: new Date(), slug: archivedSlug(category.slug, id) },
        });
      else await tx.category.delete({ where: { id } });
      await audit(tx, admin.id, used ? "category.archive" : "category.delete", "category", id);
    });
    updateTag(TAG.catalogue);
  },
);

/** Swaps a category with its previous (-1) or next (1) sibling. */
export const moveCategory = roleAction(
  "move-category",
  "admin",
  moveSchema,
  async ({ id, direction }): Promise<void> => {
    await db().$transaction(async (tx) => {
      const target = await tx.category.findFirst({ where: { id, archivedAt: null } });
      if (!target) throw new ActionError("Category not found.");
      const siblings = await tx.category.findMany({
        where: { parentId: target.parentId, archivedAt: null },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: { id: true },
      });
      const from = siblings.findIndex((row) => row.id === id);
      const to = from + direction;
      const other = siblings[to];
      if (!other) return;
      siblings[from] = other;
      siblings[to] = { id };
      for (const [position, row] of siblings.entries())
        await tx.category.update({ where: { id: row.id }, data: { position } });
    });
    updateTag(TAG.catalogue);
  },
);

/* Instructors ------------------------------------------------------------ */

export const saveInstructor = roleAction(
  "save-instructor",
  "admin",
  saveInstructorSchema,
  async ({ id, ...data }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      if (id && !(await tx.instructor.findFirst({ where: { id, archivedAt: null } })))
        throw new ActionError("Instructor not found.");
      const saved = id
        ? await tx.instructor.update({ where: { id }, data })
        : await tx.instructor.create({ data });
      await audit(
        tx,
        admin.id,
        id ? "instructor.update" : "instructor.create",
        "instructor",
        saved.id,
      );
    });
    updateTag(TAG.catalogue);
  },
);

export const removeInstructor = roleAction(
  "remove-instructor",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const instructor = await tx.instructor.findFirst({
        where: { id, archivedAt: null },
        include: { courses: { select: { archivedAt: true } } },
      });
      if (!instructor) throw new ActionError("Instructor not found.");
      if (instructor.courses.some((course) => !course.archivedAt))
        throw new ActionError("This instructor teaches at least one course. Reassign it first.");
      const used = instructor.courses.length > 0;
      if (used) await tx.instructor.update({ where: { id }, data: { archivedAt: new Date() } });
      else await tx.instructor.delete({ where: { id } });
      await audit(
        tx,
        admin.id,
        used ? "instructor.archive" : "instructor.delete",
        "instructor",
        id,
      );
    });
    updateTag(TAG.catalogue);
  },
);

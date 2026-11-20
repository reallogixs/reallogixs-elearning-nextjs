import type { Category, Course, Instructor } from "@/types/domain";
import type { Result } from "@/types/forms";
import { descendantIds } from "@/lib/domain/categories";
import { newId } from "@/lib/domain/ids";
import {
  courseSchema,
  type CategoryFormValues,
  type CourseFormValues,
  type InstructorFormValues,
} from "@/lib/validation/admin";
import { validateWith } from "@/lib/validation/validate";

import { fail, latency, nowIso, ok, read, replaceById, write } from "./client";

function slugTaken<T extends { id: string; slug: string }>(
  list: T[],
  slug: string,
  id?: string,
): boolean {
  return list.some((item) => item.slug === slug && item.id !== id);
}

/* Courses ---------------------------------------------------------------- */

export async function saveCourse(input: CourseFormValues, id?: string): Promise<Result<Course>> {
  await latency();
  const checked = await validateWith(courseSchema, input);
  if (!checked.ok) return checked;
  const values = checked.data;
  const db = read();
  if (slugTaken(db.courses, values.slug, id)) return fail("Another course already uses this slug.");
  const outcomes = values.outcomes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const existing = id ? db.courses.find((course) => course.id === id) : undefined;
  const course: Course = {
    ...values,
    outcomes,
    id: existing?.id ?? newId("crs"),
    createdAt: existing?.createdAt ?? nowIso(),
  };
  write((current) => ({
    ...current,
    courses: existing
      ? replaceById(current.courses, course.id, () => course)
      : [course, ...current.courses],
  }));
  return ok(course);
}

export async function deleteCourse(id: string): Promise<Result> {
  await latency();
  if (read().orders.some((order) => order.courseId === id)) {
    return fail(
      "This course has enrolments, so it can't be deleted. Set it to Draft to hide it instead.",
    );
  }
  write((db) => ({ ...db, courses: db.courses.filter((course) => course.id !== id) }));
  return ok(undefined);
}

export async function setEnrolmentOpen(id: string, open: boolean): Promise<Result> {
  await latency(150);
  write((db) => ({
    ...db,
    courses: replaceById(db.courses, id, (course) => ({ ...course, enrolmentOpen: open })),
  }));
  return ok(undefined);
}

/* Categories (any depth) ------------------------------------------------- */

export async function saveCategory(
  values: CategoryFormValues,
  id?: string,
): Promise<Result<Category>> {
  await latency();
  const db = read();
  if (slugTaken(db.categories, values.slug, id))
    return fail("Another category already uses this slug.");
  const parentId = values.parentId || null;
  if (id && parentId && descendantIds(db.categories, id).has(parentId)) {
    return fail("A category can't sit inside itself or one of its sub-categories.");
  }
  const existing = id ? db.categories.find((category) => category.id === id) : undefined;
  const siblings = db.categories.filter(
    (category) => category.parentId === parentId && category.id !== id,
  );
  const category: Category = {
    id: existing?.id ?? newId("cat"),
    name: values.name,
    slug: values.slug,
    description: values.description || undefined,
    parentId,
    order: existing && existing.parentId === parentId ? existing.order : siblings.length + 1,
  };
  write((current) => ({
    ...current,
    categories: existing
      ? replaceById(current.categories, category.id, () => category)
      : [...current.categories, category],
  }));
  return ok(category);
}

export async function deleteCategory(id: string): Promise<Result> {
  await latency();
  const db = read();
  if (db.categories.some((category) => category.parentId === id)) {
    return fail("Move or delete its sub-categories first.");
  }
  if (db.courses.some((course) => course.categoryId === id)) {
    return fail("Some courses use this category. Move them to another category first.");
  }
  write((current) => ({
    ...current,
    categories: current.categories.filter((category) => category.id !== id),
  }));
  return ok(undefined);
}

/** Swaps a category with its previous/next sibling. */
export async function moveCategory(id: string, direction: -1 | 1): Promise<Result> {
  const db = read();
  const target = db.categories.find((category) => category.id === id);
  if (!target) return fail("Category not found.");
  const siblings = db.categories
    .filter((category) => category.parentId === target.parentId)
    .sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((category) => category.id === id);
  const swap = siblings[index + direction];
  if (!swap) return ok(undefined);
  const reordered = [...siblings];
  reordered[index] = swap;
  reordered[index + direction] = target;
  const order = new Map(reordered.map((category, position) => [category.id, position + 1]));
  write((current) => ({
    ...current,
    categories: current.categories.map((category) =>
      order.has(category.id)
        ? { ...category, order: order.get(category.id) ?? category.order }
        : category,
    ),
  }));
  return ok(undefined);
}

/* Instructors ------------------------------------------------------------ */

export async function saveInstructor(
  values: InstructorFormValues,
  id?: string,
): Promise<Result<Instructor>> {
  await latency();
  const instructor: Instructor = { id: id ?? newId("ins"), ...values };
  write((db) => ({
    ...db,
    instructors: id
      ? replaceById(db.instructors, id, () => instructor)
      : [...db.instructors, instructor],
  }));
  return ok(instructor);
}

export async function deleteInstructor(id: string): Promise<Result> {
  await latency();
  if (read().courses.some((course) => course.instructorId === id)) {
    return fail("This instructor teaches at least one course. Reassign those courses first.");
  }
  write((db) => ({
    ...db,
    instructors: db.instructors.filter((instructor) => instructor.id !== id),
  }));
  return ok(undefined);
}

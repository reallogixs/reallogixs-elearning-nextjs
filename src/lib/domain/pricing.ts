import type { Course, PriceBreakdown, TeacherUser } from "@/types/domain";

/** Price the student pays, applying the teacher's code discount if there is one. */
export function priceFor(
  course: Pick<Course, "price">,
  teacher: TeacherUser | null,
): PriceBreakdown {
  const discountPct = teacher?.active ? teacher.discountPct : 0;
  const discount = Math.round((course.price * discountPct) / 100);
  return { base: course.price, discountPct, discount, total: course.price - discount };
}

/** Commission is calculated on what the student actually paid. */
export function commissionFor(total: number, pct: number): number {
  return Math.round((total * pct) / 100);
}

export function findTeacherByCode(teachers: TeacherUser[], code: string): TeacherUser | null {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return null;
  return teachers.find((teacher) => teacher.active && teacher.promoCode === wanted) ?? null;
}

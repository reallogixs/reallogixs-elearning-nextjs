import type { Course, PriceBreakdown } from "@/types/domain";

/** Price the student pays, after a promo code's discount if there is one. */
export function priceFor(course: Pick<Course, "price">, discountPct: number): PriceBreakdown {
  const discount = Math.round((course.price * discountPct) / 100);
  return { base: course.price, discountPct, discount, total: course.price - discount };
}

/** Commission is calculated on what the student actually paid. */
export function commissionFor(total: number, pct: number): number {
  return Math.round((total * pct) / 100);
}

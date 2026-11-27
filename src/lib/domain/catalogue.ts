import type { CatalogueCourse } from "@/types/catalogue";

import { enrolmentWith, type EnrolmentState } from "./orders";

/** How many featured courses the home page shows. */
export const FEATURED_LIMIT = 6;

export function courseSeatsLeft(course: Pick<CatalogueCourse, "seats" | "seatsTaken">): number {
  return Math.max(0, course.seats - course.seatsTaken);
}

export function courseEnrolment(course: CatalogueCourse, now?: Date): EnrolmentState {
  return enrolmentWith(course, courseSeatsLeft(course), now);
}

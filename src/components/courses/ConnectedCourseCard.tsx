"use client";

import type { ReactElement } from "react";

import type { Course } from "@/types/domain";
import { enrolmentState, seatsLeft } from "@/lib/domain/orders";
import { useDb } from "@/lib/store/hooks";
import { categoryById, instructorById } from "@/lib/store/selectors";

import { CourseCard } from "./CourseCard";

/** CourseCard wired to the store (instructor, category and seat data). */
export function ConnectedCourseCard({ course }: { course: Course }): ReactElement {
  const db = useDb();
  return (
    <CourseCard
      course={course}
      instructor={instructorById(db, course.instructorId)}
      category={categoryById(db, course.categoryId)}
      enrolment={enrolmentState(course, db.orders)}
      seatsLeft={seatsLeft(course, db.orders)}
    />
  );
}

"use client";

import type { ReactElement } from "react";

import type { CatalogueCourse } from "@/types/catalogue";
import { courseEnrolment, courseSeatsLeft } from "@/lib/domain/catalogue";
import { useCatalogue } from "@/components/data/SiteData";

import { CourseCard } from "./CourseCard";

/** CourseCard with its instructor, category and seat data. */
export function ConnectedCourseCard({ course }: { course: CatalogueCourse }): ReactElement {
  const { instructors, categories } = useCatalogue();
  return (
    <CourseCard
      course={course}
      instructor={instructors.find((instructor) => instructor.id === course.instructorId)}
      category={categories.find((category) => category.id === course.categoryId)}
      enrolment={courseEnrolment(course)}
      seatsLeft={courseSeatsLeft(course)}
    />
  );
}

import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";

import type { Category, Course, Instructor } from "@/types/domain";
import { formatDate, formatPKR, initials } from "@/lib/domain/format";
import type { EnrolmentState } from "@/lib/domain/orders";

import { CourseCover } from "./CourseCover";
import { EnrolmentBadge } from "./EnrolmentBadge";

interface CourseCardProps {
  course: Course;
  instructor?: Instructor;
  category?: Category;
  enrolment: EnrolmentState;
  seatsLeft: number;
}

export function CourseCard({
  course,
  instructor,
  category,
  enrolment,
  seatsLeft,
}: CourseCardProps): ReactElement {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-[transform,border-color,box-shadow] duration-base ease-out-expo hover:-translate-y-1 hover:border-sky-300 hover:shadow-card">
      <CourseCover title={course.title} category={category?.name} mode={course.mode} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <EnrolmentBadge state={enrolment} seatsLeft={seatsLeft} className="self-start" />
        <div className="flex flex-col gap-2">
          <h3 className="text-h4">
            <Link
              href={`/courses/${course.slug}`}
              className="group-has-[:focus-visible]:underline after:absolute after:inset-0 focus-visible:outline-none"
            >
              {course.title}
            </Link>
          </h3>
          <p className="line-clamp-2 text-small text-ink-soft">{course.summary}</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-small text-ink-soft">
          <li className="flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-4 text-teal-600" />
            {formatDate(course.startDate)}
          </li>
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4 text-teal-600" />
            {course.durationWeeks} weeks
          </li>
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          {instructor ? (
            <span className="flex min-w-0 items-center gap-2 text-small">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-sky-100 text-[0.75rem] font-medium text-teal-700"
              >
                {initials(instructor.name)}
              </span>
              <span className="truncate">{instructor.name}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex shrink-0 items-center gap-2 font-display text-h4 font-semibold">
            {formatPKR(course.price)}
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-pill bg-navy-900 text-white transition-colors group-hover:bg-teal-600"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

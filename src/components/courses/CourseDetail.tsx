"use client";

import type { ReactElement } from "react";
import { CircleCheck, Users } from "lucide-react";

import type { CatalogueCourse } from "@/types/catalogue";
import type { Course } from "@/types/domain";
import { courseEnrolment, courseSeatsLeft } from "@/lib/domain/catalogue";
import { categoryTrail } from "@/lib/domain/categories";
import { formatPKR } from "@/lib/domain/format";
import { ENROLMENT_LABEL } from "@/lib/domain/orders";
import { useCatalogue, useContent } from "@/components/data/SiteData";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { MobileActionBar } from "@/components/ui/MobileActionBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

import { CourseFacts } from "./CourseFacts";
import { EnrolmentBadge } from "./EnrolmentBadge";
import { InstructorCard } from "./InstructorCard";
import { MODE_LABEL } from "./courseLabels";

interface CourseDetailProps {
  course: CatalogueCourse;
  text: Pick<Course, "description" | "outcomes">;
}

export function CourseDetail({ course, text }: CourseDetailProps): ReactElement {
  const { coursePage } = useContent();
  const { instructors, categories } = useCatalogue();
  const instructor = instructors.find((item) => item.id === course.instructorId);
  const trail = categoryTrail(categories, course.categoryId);
  const state = courseEnrolment(course);
  const left = courseSeatsLeft(course);

  return (
    <>
      <section className="bg-gradient-soft">
        <div className="rl-stagger relative shell flex flex-col gap-5 py-12 lg:py-16">
          <Breadcrumbs
            items={[
              { label: "Courses", href: "/courses" },
              ...trail.map((category) => ({
                label: category.name,
                href: `/courses?category=${category.slug}`,
              })),
              { label: course.title },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <EnrolmentBadge state={state} seatsLeft={left} />
          </div>
          <h1 className="max-w-3xl text-h1">{course.title}</h1>
          <p className="max-w-2xl text-body-lg text-ink-soft">{course.summary}</p>
        </div>
      </section>

      <section className="shell grid gap-12 py-12 lg:grid-cols-[1fr_380px] lg:py-16">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <SectionLabel>{coursePage.aboutLabel}</SectionLabel>
            <p className="text-body-lg">{text.description}</p>
          </div>
          <div className="flex flex-col gap-4">
            <SectionLabel>{coursePage.outcomesLabel}</SectionLabel>
            <ul className="grid gap-3 sm:grid-cols-2">
              {text.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 rounded-md bg-mist p-4">
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-teal-600"
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          {instructor ? (
            <div className="flex flex-col gap-4">
              <SectionLabel>{coursePage.instructorLabel}</SectionLabel>
              <InstructorCard instructor={instructor} />
            </div>
          ) : null}
        </div>

        <aside className="order-first lg:sticky lg:top-[calc(var(--rl-header-h)+1.5rem)] lg:order-none lg:self-start">
          <div className="flex flex-col gap-5 rounded-lg border border-line bg-white p-5 shadow-card sm:p-6">
            <p className="font-mono text-label text-ink-soft uppercase">
              {MODE_LABEL[course.mode]}
            </p>
            <p className="font-display text-h2 font-semibold">{formatPKR(course.price)}</p>
            <p className="flex items-center gap-2 text-small text-ink-soft">
              <Users aria-hidden="true" className="size-4 text-teal-600" />
              {left} of {course.seats} seats left
            </p>
            {state === "open" ? (
              <Button
                href={`/checkout/${course.slug}`}
                size="lg"
                arrow
                className="hidden w-full lg:inline-flex"
              >
                Enrol now
              </Button>
            ) : (
              <Button size="lg" disabled className="hidden w-full lg:inline-flex">
                {ENROLMENT_LABEL[state]}
              </Button>
            )}
            <p className="text-small text-ink-soft">{coursePage.enrolNote}</p>
            <CourseFacts course={course} />
          </div>
        </aside>
      </section>
      <MobileActionBar>
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-h4 font-semibold">{formatPKR(course.price)}</span>
          <span className="truncate text-small text-ink-soft">{left} seats left</span>
        </div>
        {state === "open" ? (
          <Button href={`/checkout/${course.slug}`} arrow className="shrink-0">
            Enrol now
          </Button>
        ) : (
          <Button disabled className="shrink-0">
            {ENROLMENT_LABEL[state]}
          </Button>
        )}
      </MobileActionBar>
    </>
  );
}

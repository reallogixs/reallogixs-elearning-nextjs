"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { courseById } from "@/lib/store/selectors";
import { PageHeader } from "@/components/portal/PageHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";

import { CourseForm } from "./CourseForm";

export function CourseEditor({ courseId }: { courseId?: string }): ReactElement {
  const db = useDb();
  const course = courseId ? courseById(db, courseId) : undefined;
  if (courseId && !course) return <EmptyState title="Course not found" />;
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/admin/courses" },
          { label: course ? course.title : "New course" },
        ]}
      />
      <PageHeader title={course ? "Edit course" : "New course"} />
      <CourseForm key={course?.id ?? "new"} course={course} />
    </>
  );
}

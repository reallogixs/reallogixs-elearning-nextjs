import type { ReactElement } from "react";

import { PageHeader } from "@/components/portal/PageHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

import { CourseForm, type CourseFormProps } from "./CourseForm";

export function CourseEditor(props: CourseFormProps): ReactElement {
  const { course } = props;
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/admin/courses" },
          { label: course ? course.title : "New course" },
        ]}
      />
      <PageHeader title={course ? "Edit course" : "New course"} />
      <CourseForm key={course?.id ?? "new"} {...props} />
    </>
  );
}

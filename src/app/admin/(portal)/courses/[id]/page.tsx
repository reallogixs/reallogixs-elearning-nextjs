import type { ReactElement } from "react";
import { notFound } from "next/navigation";

import { CourseEditor } from "@/components/admin/CourseEditor";
import { requirePortal } from "@/server/core/page";
import { getCatalogue, getCourseText } from "@/server/queries/catalogue";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  await requirePortal("admin");
  const { id } = await params;
  const { courses, categories, instructors } = await getCatalogue();
  const course = courses.find((item) => item.id === id) ?? notFound();
  const text = (await getCourseText(id)) ?? notFound();
  return (
    <CourseEditor
      course={{ ...course, ...text }}
      categories={categories}
      instructors={instructors}
    />
  );
}

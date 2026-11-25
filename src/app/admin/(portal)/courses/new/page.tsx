import type { ReactElement } from "react";

import { CourseEditor } from "@/components/admin/CourseEditor";
import { requirePortal } from "@/server/core/page";
import { getCatalogue } from "@/server/queries/catalogue";

export default async function NewCoursePage(): Promise<ReactElement> {
  await requirePortal("admin");
  const { categories, instructors } = await getCatalogue();
  return <CourseEditor categories={categories} instructors={instructors} />;
}

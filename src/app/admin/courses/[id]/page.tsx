import type { ReactElement } from "react";

import { CourseEditor } from "@/components/admin/CourseEditor";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  return <CourseEditor courseId={id} />;
}

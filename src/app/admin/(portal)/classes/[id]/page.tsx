import type { ReactElement } from "react";

import { ClassRoom } from "@/components/admin/ClassRoom";

export default async function AdminClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  return <ClassRoom courseId={id} />;
}

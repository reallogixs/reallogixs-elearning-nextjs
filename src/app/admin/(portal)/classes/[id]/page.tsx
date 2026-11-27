import type { ReactElement } from "react";

import { ClassRoom } from "@/components/admin/ClassRoom";

/** Completing a class starts sending its certificates before handing over to the queue. */
export const maxDuration = 60;

export default async function AdminClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  return <ClassRoom courseId={id} />;
}

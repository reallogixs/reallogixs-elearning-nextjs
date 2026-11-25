import type { ReactElement } from "react";

import { CoursesAdmin } from "@/components/admin/CoursesAdmin";
import { requirePortal } from "@/server/core/page";
import { getCatalogue } from "@/server/queries/catalogue";

export default async function AdminCoursesPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <CoursesAdmin {...await getCatalogue()} />;
}

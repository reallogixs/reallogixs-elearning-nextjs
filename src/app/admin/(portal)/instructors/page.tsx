import type { ReactElement } from "react";

import { InstructorsAdmin } from "@/components/admin/InstructorsAdmin";
import { requirePortal } from "@/server/core/page";
import { getCatalogue } from "@/server/queries/catalogue";

export default async function AdminInstructorsPage(): Promise<ReactElement> {
  await requirePortal("admin");
  const { instructors } = await getCatalogue();
  return <InstructorsAdmin instructors={instructors} />;
}

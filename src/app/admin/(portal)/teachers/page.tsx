import type { ReactElement } from "react";

import { TeachersAdmin } from "@/components/admin/TeachersAdmin";
import { requirePortal } from "@/server/core/page";
import { listTeacherAccounts } from "@/server/queries/accounts";

export default async function AdminTeachersPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <TeachersAdmin accounts={await listTeacherAccounts()} />;
}

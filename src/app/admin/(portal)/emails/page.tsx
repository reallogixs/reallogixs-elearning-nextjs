import type { ReactElement } from "react";

import { EmailLog } from "@/components/admin/EmailLog";
import { requirePortal } from "@/server/core/page";
import { listEmails } from "@/server/queries/classes";

export default async function AdminEmailsPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <EmailLog emails={await listEmails()} />;
}

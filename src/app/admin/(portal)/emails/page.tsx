import type { ReactElement } from "react";

import { EmailLog } from "@/components/admin/EmailLog";
import { requirePortal } from "@/server/core/page";
import { emailQueueStats, listEmails } from "@/server/queries/classes";

/** Long enough for "Send queued now". */
export const maxDuration = 60;

export default async function AdminEmailsPage(): Promise<ReactElement> {
  await requirePortal("admin");
  const [emails, stats] = await Promise.all([listEmails(), emailQueueStats()]);
  return <EmailLog emails={emails} stats={stats} />;
}

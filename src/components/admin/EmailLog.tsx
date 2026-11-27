import type { ReactElement } from "react";
import { CircleCheck, CircleX, Clock, Mail } from "lucide-react";

import type { EmailLogEntry, EmailQueueStats } from "@/types/portal";
import { formatDateTime } from "@/lib/domain/format";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";

import { EmailQueuePanel } from "./EmailQueuePanel";

const STATUS: Record<EmailLogEntry["status"], ReactElement> = {
  sent: (
    <Badge tone="success" icon={<CircleCheck />}>
      Sent
    </Badge>
  ),
  failed: (
    <Badge tone="danger" icon={<CircleX />}>
      Failed
    </Badge>
  ),
  queued: (
    <Badge tone="warning" icon={<Clock />}>
      Queued
    </Badge>
  ),
};

/** What was emailed to whom. The text isn't kept: it can hold one-time links. */
export function EmailLog({
  emails,
  stats,
}: {
  emails: EmailLogEntry[];
  stats: EmailQueueStats;
}): ReactElement {
  return (
    <>
      <PageHeader
        title="Email log"
        description="The latest 200 emails. Certificates go out in batches of about 30 a minute, so a big class takes a while. Other failed emails can be sent again from their class, certificate or teacher."
      />
      <EmailQueuePanel stats={stats} />
      <DataTable
        caption="Emails"
        rows={emails}
        rowKey={(email) => email.id}
        empty={<EmptyState icon={<Mail className="size-5" />} title="No emails yet" />}
        columns={[
          {
            key: "subject",
            header: "Subject",
            wrap: true,
            cell: (email) => <span className="font-medium">{email.subject}</span>,
          },
          { key: "to", header: "To", wrap: true, cell: (email) => email.to },
          {
            key: "date",
            header: "Date",
            hideBelow: "xl",
            cell: (email) => formatDateTime(email.createdAt),
          },
          { key: "status", header: "Status", cell: (email) => STATUS[email.status] },
        ]}
      />
    </>
  );
}

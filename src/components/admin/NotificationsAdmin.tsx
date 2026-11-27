import type { ReactElement } from "react";
import Link from "next/link";
import { BellOff, ChevronRight, MailWarning, ReceiptText, Video } from "lucide-react";

import type { AdminNotice } from "@/types/portal";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/domain/format";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const ICON: Record<AdminNotice["kind"], ReactElement> = {
  payment: <ReceiptText />,
  class: <Video />,
  email: <MailWarning />,
};

export function NotificationsAdmin({ notices }: { notices: AdminNotice[] }): ReactElement {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Only what needs you: payments to confirm, classes to start or complete, and emails that failed. Each one clears once it's dealt with."
      />
      {notices.length === 0 ? (
        <EmptyState
          icon={<BellOff className="size-5" />}
          title="You're all caught up"
          body="New payments and classes that need you will show up here."
        />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-md border border-line/80 bg-white shadow-soft">
          {notices.map((notice) => (
            <li key={notice.id} className="border-b border-line/80 last:border-b-0">
              <Link
                href={notice.href}
                className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-canvas sm:px-5"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-pill [&>svg]:size-5",
                    notice.urgent ? "bg-error/10 text-error-text" : "bg-sky-100 text-teal-700",
                  )}
                >
                  {ICON[notice.kind]}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{notice.title}</span>
                    {notice.urgent ? <Badge tone="danger">Needs action</Badge> : null}
                  </span>
                  <span className="text-small text-ink-soft">{notice.body}</span>
                  <span className="text-dash-meta font-normal text-ink-soft">
                    {formatDateTime(notice.at)}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="mt-2 size-4 shrink-0 text-ink-soft" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

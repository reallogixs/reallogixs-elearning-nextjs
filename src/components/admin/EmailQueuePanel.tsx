"use client";

import type { ReactElement } from "react";
import { RotateCcw, Send } from "lucide-react";

import type { EmailQueueStats } from "@/types/portal";
import { useAction } from "@/lib/useAction";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { retryFailedEmails, sendQueuedNow } from "@/server/actions/emails";

/** Bulk emails (e.g. a class's certificates) go out in batches; this shows how far along they are. */
export function EmailQueuePanel({ stats }: { stats: EmailQueueStats }): ReactElement {
  const { run, pending } = useAction();
  const { notify } = useToast();
  async function act(key: string, action: typeof sendQueuedNow): Promise<void> {
    const result = await run(key, () => action({}));
    if (result.ok) notify(result.data.notice);
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Waiting to send"
          value={stats.queued}
          hint={stats.retrying ? `${stats.retrying} retrying after a failure` : "Sent in batches"}
          icon={<Send />}
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          hint={stats.retryable ? `${stats.retryable} can be retried` : "Nothing to retry"}
          icon={<RotateCcw />}
        />
        <StatCard label="Sent in 24 hours" value={stats.sentToday} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          icon={<Send className="size-4" />}
          loading={pending === "run"}
          disabled={!stats.queued}
          onClick={() => act("run", sendQueuedNow)}
        >
          Send queued now
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<RotateCcw className="size-4" />}
          loading={pending === "retry"}
          disabled={!stats.retryable}
          onClick={() => act("retry", retryFailedEmails)}
        >
          Retry failed
        </Button>
      </div>
    </div>
  );
}

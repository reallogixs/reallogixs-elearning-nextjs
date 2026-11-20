import type { ReactElement, ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  body,
  icon,
  action,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-pill bg-mist text-teal-600"
      >
        {icon ?? <Inbox className="size-5" />}
      </span>
      <p className="font-display text-h4">{title}</p>
      {body ? <p className="max-w-md text-small text-ink-soft">{body}</p> : null}
      {action}
    </div>
  );
}

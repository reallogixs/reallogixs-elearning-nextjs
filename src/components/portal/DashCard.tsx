import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface DashCardProps {
  title: string;
  description?: ReactNode;
  /** Link or button on the right of the title row. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Dashboard panel: title row, then content. */
export function DashCard({
  title,
  description,
  action,
  className,
  children,
}: DashCardProps): ReactElement {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-5 rounded-md border border-line/80 bg-white p-5 shadow-soft sm:p-6",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-dash-heading text-ink">{title}</h2>
          {description ? (
            <p className="text-dash-meta font-normal text-ink-soft">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

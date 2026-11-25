import type { ReactElement } from "react";

import { cn } from "@/lib/cn";

function Block({ className }: { className?: string }): ReactElement {
  return <div className={cn("animate-pulse rounded-md bg-line/70", className)} />;
}

/** The shape of a portal page while its data is loading. */
export function PortalLoading(): ReactElement {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Block className="h-8 w-56 max-w-full" />
        <Block className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        <Block className="h-32" />
        <Block className="h-32" />
        <Block className="hidden h-32 xl:block" />
      </div>
      <div
        aria-hidden="true"
        className="flex flex-col gap-4 rounded-md border border-line/80 bg-white p-5"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Block key={index} className="h-9" />
        ))}
      </div>
    </div>
  );
}

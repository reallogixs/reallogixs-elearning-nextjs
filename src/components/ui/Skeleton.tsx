import type { ReactElement } from "react";

import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }): ReactElement {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-mist", className)} />;
}

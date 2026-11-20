import type { ReactElement } from "react";

import { cn } from "@/lib/cn";

/** The brand motif: a circuit line that ends in a ring node. Decorative. */
export function CircuitLine({ className }: { className?: string }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 40"
      fill="none"
      preserveAspectRatio="none"
      className={cn("h-10 w-full text-sky-400", className)}
    >
      <path
        d="M0 30H220L250 10H560"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="572"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

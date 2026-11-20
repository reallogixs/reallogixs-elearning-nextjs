import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** `• OUR COURSES` mono label with a sky dot (DESIGN.md §5). */
export function SectionLabel({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}): ReactElement {
  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-label uppercase",
        tone === "light" ? "text-ink-soft" : "text-on-dark-soft",
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-pill bg-sky-400" />
      {children}
    </p>
  );
}

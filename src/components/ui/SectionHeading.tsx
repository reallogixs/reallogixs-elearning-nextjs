import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { SectionLabel } from "./SectionLabel";

interface SectionHeadingProps {
  id?: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
  /** Button or link shown on the right (below on phones). */
  action?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}

/** Label + h2 + optional intro and action: the top of every home section. */
export function SectionHeading({
  id,
  label,
  title,
  description,
  action,
  tone = "light",
  align = "left",
}: SectionHeadingProps): ReactElement {
  const dark = tone === "dark";
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        centered && "items-center text-center md:flex-col md:items-center",
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", centered && "items-center")}>
        <SectionLabel tone={tone}>{label}</SectionLabel>
        <h2 id={id} className={cn("text-h2", dark && "text-white")}>
          {title}
        </h2>
        {description ? (
          <p className={cn("text-body-lg", dark ? "text-on-dark-soft" : "text-ink-soft")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

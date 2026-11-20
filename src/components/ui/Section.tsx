import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SectionTone = "white" | "mist" | "dark" | "mesh";

const tones: Record<SectionTone, string> = {
  white: "bg-white",
  mist: "bg-mist",
  dark: "on-dark bg-navy-950 text-on-dark",
  mesh: "on-dark bg-mesh text-on-dark",
};

interface SectionProps {
  id?: string;
  tone?: SectionTone;
  /** Visible heading for the section; passed through to `aria-labelledby` when given. */
  labelledBy?: string;
  className?: string;
  /** Classes for the inner content column. */
  innerClassName?: string;
  children: ReactNode;
}

/**
 * Page band with the shared vertical rhythm: `py-section` outside, `gap-section-gap`
 * between heading and content. Alternate tones so neighbouring bands don't double up.
 */
export function Section({
  id,
  tone = "white",
  labelledBy,
  className,
  innerClassName,
  children,
}: SectionProps): ReactElement {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative scroll-mt-24 overflow-hidden py-section", tones[tone], className)}
    >
      <div className={cn("relative shell flex flex-col gap-section-gap", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

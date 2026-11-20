import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "dark";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-white text-ink-soft",
  info: "border-sky-300/60 bg-sky-100 text-teal-700",
  success: "border-success/30 bg-success/10 text-success-text",
  warning: "border-warning/40 bg-warning/10 text-warning-text",
  danger: "border-error/30 bg-error/10 text-error-text",
  dark: "border-transparent bg-navy-900 text-white",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", icon, className, children }: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-tag whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="flex [&>svg]:size-3.5">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

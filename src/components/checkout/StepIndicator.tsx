import type { ReactElement } from "react";

import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

/** "01 / 03" plus a gradient progress bar (DESIGN.md multi-step form shell). */
export function StepIndicator({ steps, current }: StepIndicatorProps): ReactElement {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between font-mono text-label text-ink-soft uppercase">
        <span>
          {pad(current + 1)} / {pad(steps.length)}
        </span>
        <span>{steps[current]}</span>
      </div>
      <div
        className="h-0.5 overflow-hidden rounded-pill bg-line"
        role="progressbar"
        aria-label="Checkout progress"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
      >
        <div
          className={cn(
            "h-full origin-left bg-gradient-logic transition-transform duration-progress ease-out-expo",
          )}
          style={{ transform: `scaleX(${(current + 1) / steps.length})` }}
        />
      </div>
    </div>
  );
}

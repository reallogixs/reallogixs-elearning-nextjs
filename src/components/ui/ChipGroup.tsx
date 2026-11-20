import type { ReactElement } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export interface ChipOption<V extends string> {
  value: V;
  label: string;
}

interface ChipGroupProps<V extends string> {
  label: string;
  options: ChipOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** "chips": separate pills (public site). "segmented": one compact control (dashboards). */
  variant?: "chips" | "segmented";
}

/** Single-select filter: pill chips, or a segmented control for dashboards. */
export function ChipGroup<V extends string>({
  label,
  options,
  value,
  onChange,
  variant = "chips",
}: ChipGroupProps<V>): ReactElement {
  const segmented = variant === "segmented";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap",
        segmented ? "gap-1 rounded-md border border-line/80 bg-white p-1 shadow-soft" : "gap-2",
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 transition-colors duration-fast",
              segmented
                ? cn(
                    "min-h-10 rounded-sm px-3.5 text-small font-medium",
                    selected
                      ? "bg-navy-900 text-white"
                      : "text-ink-soft hover:bg-canvas hover:text-ink",
                  )
                : cn(
                    "min-h-11 rounded-pill border px-4 text-tag",
                    selected
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-line text-ink hover:border-navy-600/45",
                  ),
            )}
          >
            {selected && !segmented ? <Check aria-hidden="true" className="size-3.5" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

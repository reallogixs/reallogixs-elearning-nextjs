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
  /** "chips": pills (public site). "segmented": compact control (dashboards). "list": full-width rows (drawers). */
  variant?: "chips" | "segmented" | "list";
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
  const list = variant === "list";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex",
        list ? "flex-col gap-1" : "flex-wrap",
        segmented
          ? "gap-1 rounded-md border border-line/80 bg-white p-1 shadow-soft"
          : !list && "gap-2",
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
              list
                ? cn(
                    "min-h-12 justify-between rounded-sm px-3 text-left text-small font-medium",
                    selected ? "bg-sky-100 text-navy-900" : "text-ink hover:bg-canvas",
                  )
                : segmented
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
            {selected && !segmented && !list ? (
              <Check aria-hidden="true" className="size-3.5" />
            ) : null}
            {option.label}
            {selected && list ? (
              <Check aria-hidden="true" className="size-4 text-teal-700" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

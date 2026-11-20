import type { ComponentProps, ReactElement } from "react";

import { cn } from "@/lib/cn";

interface SwitchProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
  description?: string;
}

/** Checkbox styled as a toggle; the whole row is the hit area. */
export function Switch({ label, description, className, ...props }: SwitchProps): ReactElement {
  return (
    <label className={cn("flex min-h-11 items-center justify-between gap-4", className)}>
      <span className="flex flex-col">
        <span className="text-small font-medium text-ink">{label}</span>
        {description ? <span className="text-small text-ink-soft">{description}</span> : null}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" {...props} className="peer sr-only" />
        <span
          aria-hidden="true"
          className="h-6 w-11 rounded-pill bg-line transition-colors duration-fast peer-checked:bg-teal-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-glow"
        />
        <span
          aria-hidden="true"
          className="absolute top-0.5 left-0.5 size-5 rounded-pill bg-white shadow-card transition-transform duration-fast peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}

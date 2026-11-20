import type { ComponentProps, ReactElement } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

import { fieldControlClass } from "./fieldStyles";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends ComponentProps<"select"> {
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ options, placeholder, className, ...props }: SelectProps): ReactElement {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          fieldControlClass(Boolean(props["aria-invalid"])),
          "h-12 appearance-none pr-10",
          className,
        )}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}

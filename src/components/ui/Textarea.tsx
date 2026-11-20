import type { ComponentProps, ReactElement } from "react";

import { cn } from "@/lib/cn";

import { fieldControlClass } from "./fieldStyles";

export function Textarea({
  className,
  rows = 4,
  ...props
}: ComponentProps<"textarea">): ReactElement {
  return (
    <textarea
      rows={rows}
      {...props}
      className={cn(fieldControlClass(Boolean(props["aria-invalid"])), "py-3", className)}
    />
  );
}

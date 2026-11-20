import type { ComponentProps, ReactElement } from "react";

import { cn } from "@/lib/cn";

import { fieldControlClass } from "./fieldStyles";

export function Input({ className, ...props }: ComponentProps<"input">): ReactElement {
  return (
    <input
      {...props}
      className={cn(fieldControlClass(Boolean(props["aria-invalid"])), "h-12", className)}
    />
  );
}

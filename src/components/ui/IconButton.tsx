import type { ComponentProps, ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  /** Accessible name; icon-only buttons must have one. */
  label: string;
  children: ReactNode;
  tone?: "light" | "dark";
}

/** 44×44 icon-only button. */
export function IconButton({
  label,
  children,
  tone = "light",
  className,
  ...rest
}: IconButtonProps): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-pill transition-colors duration-fast disabled:opacity-40",
        tone === "light" ? "text-ink hover:bg-mist" : "text-on-dark hover:bg-white/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

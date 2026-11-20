import type { ComponentProps, ReactElement } from "react";

import { cn } from "@/lib/cn";

interface CardProps extends ComponentProps<"div"> {
  tone?: "light" | "mist" | "dark";
  padded?: boolean;
}

const tones = {
  light: "border border-line/80 bg-white shadow-soft",
  mist: "border border-transparent bg-mist",
  dark: "border border-line-dark bg-navy-900 text-on-dark",
} as const;

export function Card({
  tone = "light",
  padded = true,
  className,
  ...props
}: CardProps): ReactElement {
  return (
    <div {...props} className={cn("rounded-md", tones[tone], padded && "p-5 sm:p-6", className)} />
  );
}

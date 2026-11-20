import { useId, type ReactElement } from "react";

import { cn } from "@/lib/cn";

import { LOGO_PATH, LOGO_VIEWBOX } from "./logoPath";

interface LogoProps {
  /** Accessible name. Omit when the logo sits inside a link that already has a name. */
  title?: string;
  className?: string;
}

/**
 * The official Reallogixs logo (vector trace of `brand/reallogixs-logo.jpg`): the
 * wordmark and circuit line in one shape, filled with the logo's teal → sky → navy
 * gradient. Stop colours come from the --logo-* variables so it adapts to dark surfaces.
 */
export function Logo({ title, className }: LogoProps): ReactElement {
  const gradientId = `logo-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("h-7 w-auto lg:h-8", className)}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="1182"
          y2="0"
        >
          <stop offset="0" stopColor="var(--logo-real)" />
          <stop offset="0.44" stopColor="var(--logo-o)" />
          <stop offset="0.58" stopColor="var(--logo-o)" />
          <stop offset="0.645" stopColor="var(--logo-gixs)" />
          <stop offset="1" stopColor="var(--logo-gixs)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradientId})`} d={LOGO_PATH} />
    </svg>
  );
}

import { useId, type ReactElement } from "react";

import { cn } from "@/lib/cn";

interface GrainProps {
  className?: string;
}

/** Film-grain overlay for gradient panels (DESIGN.md §2.2). Decorative. */
export function Grain({ className }: GrainProps): ReactElement {
  const filterId = `grain-${useId().replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full opacity-[0.08] mix-blend-overlay",
        className,
      )}
    >
      <filter id={filterId}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}

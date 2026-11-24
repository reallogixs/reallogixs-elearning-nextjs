"use client";

import { useRef, type ReactElement, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface ScrollMarqueeProps {
  children: ReactNode;
  /** How many times the content repeats, so the row is always wider than the screen. */
  repeat?: number;
  /** Distance travelled across the section's scroll range, as a share of the viewport width. */
  travel?: number;
  /** Move right instead of left as the page scrolls down. */
  reverse?: boolean;
  className?: string;
}

/**
 * M8 (scroll variant) — a horizontal row that only moves while the page scrolls:
 * its x position is scrubbed to the section's progress through the viewport, so it
 * stops when scrolling stops and runs backwards when scrolling up. Static for reduced
 * motion. Only the first copy of the content is exposed to assistive technology.
 */
export function ScrollMarquee({
  children,
  repeat = 3,
  travel = 0.6,
  reverse = false,
  className,
}: ScrollMarqueeProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const copies = Array.from({ length: repeat }, (_, index) => index);

  useGSAP(
    () => {
      const el = ref.current;
      const track = el?.querySelector<HTMLElement>("[data-track]");
      if (!el || !track || reducedMotion) return;

      const distance = (): number => window.innerWidth * travel;
      gsap.fromTo(
        track,
        { x: () => (reverse ? -distance() : 0) },
        {
          x: () => (reverse ? 0 : -distance()),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [reducedMotion, travel, reverse] },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div data-track className="flex w-max items-center">
        {copies.map((copy) => (
          <div
            key={copy}
            aria-hidden={copy > 0 ? true : undefined}
            className="flex shrink-0 items-center"
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

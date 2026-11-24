"use client";

import { useRef, type ReactElement } from "react";

import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function format(value: number, decimals: number): string {
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * M9 — counts up from zero when scrolled into view (once). The final value is in the
 * server HTML and read by screen readers; the animated digits are hidden from them.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  className,
}: CounterProps): ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const decimals = Number.isInteger(value) ? 0 : 1;
  const finalText = `${prefix}${format(value, decimals)}${suffix}`;

  useGSAP(
    () => {
      const digits = ref.current?.querySelector<HTMLElement>("[data-digits]");
      if (!digits || reducedMotion) return;

      const state = { current: 0 };
      const render = (): void => {
        digits.textContent = `${prefix}${format(state.current, decimals)}${suffix}`;
      };
      render();

      gsap.to(state, {
        current: value,
        duration: 1.6,
        ease: EASE.inOut,
        onUpdate: render,
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
    },
    { scope: ref, dependencies: [reducedMotion, value, prefix, suffix] },
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span className="sr-only">{finalText}</span>
      <span data-digits aria-hidden="true">
        {finalText}
      </span>
    </span>
  );
}

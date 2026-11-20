"use client";

import { useRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, STAGGER } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface RevealProps {
  as?: ElementType;
  /** Animate direct children one after another instead of the block as a whole. */
  stagger?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Fade-up on scroll (main site M3). Hidden state is set by GSAP, so content stays
 * visible without JS; reduced motion shows everything immediately.
 */
export function Reveal({
  as: Tag = "div",
  stagger = false,
  className,
  children,
}: RevealProps): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;
      const targets = stagger ? Array.from(root.children) : [root];
      gsap.from(targets, {
        y: 32,
        opacity: 0,
        duration: DURATION.slow,
        ease: EASE.outExpo,
        stagger: stagger ? STAGGER * 1.5 : 0,
        scrollTrigger: { trigger: root, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced, stagger] },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

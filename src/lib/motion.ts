/** Motion tokens (mirrors the main site's DESIGN.md §7.2). */
export const EASE = {
  outExpo: "expo.out",
  inOut: "power2.inOut",
} as const;

export const DURATION = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
} as const;

export const STAGGER = 0.06;

import type { ReactElement } from "react";

import { cn } from "@/lib/cn";
import { INK } from "@/lib/certificateLayout";

/** Lucide's badge-check, drawn in a 24-unit box. */
export const CHECK_BADGE =
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z";
export const CHECK_TICK = "m9 12 2 2 4-4";

/**
 * Round "verified" seal. Drawn in a 100-unit box, so the word always fits inside the ring at
 * any size; the PDF draws the same shapes. Decorative.
 */
export function CertificateSeal({ className }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn("size-24 shrink-0 drop-shadow-lg", className)}
    >
      <circle cx="50" cy="50" r="50" fill={INK.skyLight} />
      <circle cx="50" cy="50" r="45" fill={INK.navy} />
      <circle
        cx="50"
        cy="50"
        r="39"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <g
        transform="translate(37 25) scale(1.08)"
        fill="none"
        stroke="#5FD3F5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={CHECK_BADGE} />
        <path d={CHECK_TICK} />
      </g>
      <text
        x="50"
        y="69"
        textAnchor="middle"
        textLength="46"
        lengthAdjust="spacingAndGlyphs"
        fontSize="9"
        fontWeight="600"
        fill="#FFFFFF"
        style={{ fontFamily: "var(--font-cert-sans), sans-serif" }}
      >
        VERIFIED
      </text>
    </svg>
  );
}

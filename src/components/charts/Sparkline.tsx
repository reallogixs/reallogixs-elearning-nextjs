import type { ReactElement } from "react";

interface SparklineProps {
  values: number[];
  className?: string;
}

/** Decorative trend for a stat tile: muted line, current point in the accent. */
export function Sparkline({ values, className }: SparklineProps): ReactElement | null {
  if (values.length < 2) return null;
  const width = 96;
  const height = 32;
  const max = Math.max(1, ...values);
  const x = (index: number): number => 2 + (index / (values.length - 1)) * (width - 4);
  const y = (value: number): number => height - 3 - (value / max) * (height - 6);
  const path = values.map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`).join("");
  const last = values.length - 1;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
    >
      <path
        d={path}
        fill="none"
        stroke="var(--rl-ink-soft)"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={x(last)}
        cy={y(values[last] ?? 0)}
        r={3}
        fill="var(--rl-chart-1)"
        stroke="var(--rl-white)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

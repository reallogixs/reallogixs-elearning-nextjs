import type { ReactElement, ReactNode } from "react";

export interface Segment {
  key: string;
  label: string;
  value: number;
  /** Status fill for the bar (e.g. "var(--rl-success)"). */
  color: string;
  /** Darker step of the same status for the icon, so it passes contrast on white. */
  ink: string;
  /** Status always ships with an icon, never colour alone. */
  icon: ReactNode;
}

/** Thin segmented bar (one whole split into parts) with an icon + label + count legend. */
export function SegmentedBar({
  label,
  segments,
}: {
  label: string;
  segments: Segment[];
}): ReactElement {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const share = (value: number): number => (total ? Math.round((value / total) * 100) : 0);
  const summary = segments
    .map((segment) => `${segment.label} ${segment.value} (${share(segment.value)}%)`)
    .join(", ");
  return (
    <div className="flex flex-col gap-5">
      <div role="img" aria-label={`${label}: ${summary}`} className="flex h-2 w-full gap-0.5">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              key={segment.key}
              title={`${segment.label}: ${segment.value}`}
              className="h-full rounded-pill first:rounded-l-pill last:rounded-r-pill"
              style={{ flexGrow: segment.value, backgroundColor: segment.color }}
            />
          ))}
      </div>
      <ul className="flex flex-col gap-3">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center justify-between gap-3 text-small">
            <span className="flex items-center gap-2.5 text-ink">
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-sm [&>svg]:size-4"
                style={{
                  color: segment.ink,
                  backgroundColor: `color-mix(in srgb, ${segment.color} 14%, transparent)`,
                }}
              >
                {segment.icon}
              </span>
              {segment.label}
            </span>
            <span className="tabular-nums">
              <span className="font-semibold text-ink">{segment.value}</span>
              <span className="ml-2 text-ink-soft">{share(segment.value)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

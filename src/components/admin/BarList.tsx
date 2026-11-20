import type { ReactElement } from "react";

export interface BarItem {
  label: string;
  value: number;
  /** Maximum for this row (e.g. seats); defaults to the largest value in the list. */
  max?: number;
  display: string;
}

/** Meter rows: the track is a light step of the fill's hue so fullness reads across the bar. */
export function BarList({ items }: { items: BarItem[] }): ReactElement {
  const largest = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const ratio = Math.min(1, item.value / (item.max ?? largest));
        return (
          <li
            key={item.label}
            className="flex flex-col gap-2"
            title={`${item.label}: ${item.display}`}
          >
            <div className="flex justify-between gap-4 text-small">
              <span className="truncate text-ink">{item.label}</span>
              <span className="shrink-0 font-semibold text-ink tabular-nums">{item.display}</span>
            </div>
            <div aria-hidden="true" className="h-2 overflow-hidden rounded-pill bg-sky-100">
              <div
                className="h-full origin-left rounded-pill bg-chart-1"
                style={{ transform: `scaleX(${ratio})` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

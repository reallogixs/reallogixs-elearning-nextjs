"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
} from "react";

import { niceScale, type SeriesPoint } from "@/lib/domain/analytics";
import { formatShortDate } from "@/lib/domain/format";

import { ChartTable } from "./ChartTable";
import { useElementWidth } from "./useElementWidth";

interface AreaChartProps {
  /** Accessible name; the card title names the series, so there is no legend. */
  label: string;
  points: SeriesPoint[];
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  height?: number;
}

const PAD = { top: 12, right: 12, bottom: 28, left: 52 };

/**
 * Single-series area chart (dataviz spec): 2px line, ~10% wash, hairline grid,
 * crosshair + tooltip on hover and arrow keys, and a table view.
 */
export function AreaChart({
  label,
  points,
  formatValue,
  formatTick,
  height = 240,
}: AreaChartProps): ReactElement {
  const frameRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(frameRef);
  const gradientId = `area-${useId().replace(/:/g, "")}`;
  const [active, setActive] = useState<number | null>(null);

  const innerWidth = Math.max(0, width - PAD.left - PAD.right);
  const innerHeight = height - PAD.top - PAD.bottom;
  const { max, step } = niceScale(Math.max(...points.map((point) => point.value)));
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, index) => index * step);
  const x = (index: number): number =>
    PAD.left + (points.length > 1 ? (index / (points.length - 1)) * innerWidth : innerWidth / 2);
  const y = (value: number): number => PAD.top + innerHeight - (value / max) * innerHeight;

  const line = points
    .map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point.value)}`)
    .join("");
  const area = `${line}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const labelEvery = innerWidth < 420 ? 3 : 2;
  const current = active === null ? null : points[active];
  const lastIndex = points.length - 1;

  function onPointerMove(event: PointerEvent<SVGRectElement>): void {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setActive(Math.max(0, Math.min(lastIndex, Math.round(ratio * lastIndex))));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setActive((index) =>
      Math.max(
        0,
        Math.min(lastIndex, (index ?? lastIndex) + (event.key === "ArrowRight" ? 1 : -1)),
      ),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={frameRef}
        role="group"
        tabIndex={0}
        aria-label={`${label}. Use the left and right arrow keys to read each week.`}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((index) => index ?? lastIndex)}
        onBlur={() => setActive(null)}
        className="relative rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ height }}
      >
        {width > 0 ? (
          <svg width={width} height={height} aria-hidden="true" className="block overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--rl-chart-1)" stopOpacity="0.18" />
                <stop offset="1" stopColor="var(--rl-chart-1)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + innerWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--rl-line)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 10}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-ink-soft text-[11px] tabular-nums"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {points.map((point, index) =>
              index % labelEvery === lastIndex % labelEvery ? (
                <text
                  key={point.start}
                  x={x(index)}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-ink-soft text-[11px]"
                >
                  {formatShortDate(point.start)}
                </text>
              ) : null,
            )}
            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              stroke="var(--rl-chart-1)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {active === null ? (
              <circle
                cx={x(lastIndex)}
                cy={y(points[lastIndex]?.value ?? 0)}
                r={4}
                fill="var(--rl-chart-1)"
                stroke="var(--rl-white)"
                strokeWidth={2}
              />
            ) : (
              <g>
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={PAD.top + innerHeight}
                  stroke="var(--rl-ink-soft)"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
                <circle
                  cx={x(active)}
                  cy={y(current?.value ?? 0)}
                  r={5}
                  fill="var(--rl-chart-1)"
                  stroke="var(--rl-white)"
                  strokeWidth={2}
                />
              </g>
            )}
            <rect
              x={PAD.left}
              y={PAD.top}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onPointerMove={onPointerMove}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        ) : null}
        {current && active !== null ? (
          <div
            aria-live="polite"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-sm border border-line bg-white px-3 py-2 whitespace-nowrap shadow-card"
            style={{ left: Math.min(Math.max(x(active), PAD.left + 70), width - 70) }}
          >
            <p className="text-small font-semibold text-ink tabular-nums">
              {formatValue(current.value)}
            </p>
            <p className="flex items-center gap-1.5 text-dash-meta text-ink-soft">
              <span aria-hidden="true" className="h-0.5 w-3 rounded-pill bg-chart-1" />
              Week of {formatShortDate(current.start)}
            </p>
          </div>
        ) : null}
      </div>
      <ChartTable
        caption={label}
        columns={["Week of", "Value"]}
        rows={points.map((point) => [formatShortDate(point.start), formatValue(point.value)])}
      />
    </div>
  );
}

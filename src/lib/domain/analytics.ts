import type { Order } from "@/types/domain";

export interface SeriesPoint {
  /** Bucket start (ISO date). */
  start: string;
  value: number;
}

const DAY = 86_400_000;

/** When the admin confirmed the order (null if it never was). */
export function confirmedAt(order: Order): string | null {
  return order.history.find((event) => event.status === "confirmed")?.at ?? null;
}

/**
 * Sums `value` into 7-day buckets ending at `end`, oldest first. Orders are dated by
 * `dateOf`; orders it returns null for are skipped.
 */
export function weeklySeries(
  orders: Order[],
  end: Date,
  weeks: number,
  dateOf: (order: Order) => string | null,
  value: (order: Order) => number,
): SeriesPoint[] {
  const last = new Date(end);
  last.setHours(23, 59, 59, 999);
  const first = last.getTime() - weeks * 7 * DAY;
  const buckets = Array.from({ length: weeks }, (_, index) => ({
    start: new Date(first + index * 7 * DAY + 1).toISOString(),
    value: 0,
  }));
  for (const order of orders) {
    const at = dateOf(order);
    if (!at) continue;
    const time = new Date(at).getTime();
    if (time <= first || time > last.getTime()) continue;
    const index = Math.min(weeks - 1, Math.floor((time - first) / (7 * DAY)));
    const bucket = buckets[index];
    if (bucket) bucket.value += value(order);
  }
  return buckets;
}

/** Change of the last `span` points against the `span` before them, in percent (null if no base). */
export function periodChange(points: SeriesPoint[], span: number): number | null {
  const sum = (list: SeriesPoint[]): number =>
    list.reduce((total, point) => total + point.value, 0);
  const recent = sum(points.slice(-span));
  const previous = sum(points.slice(-2 * span, -span));
  if (previous === 0) return null;
  return Math.round(((recent - previous) / previous) * 100);
}

/** Clean axis maximum and tick step so 4–5 ticks cover the data. */
export function niceScale(max: number, ticks = 4): { max: number; step: number } {
  if (max <= 0) return { max: ticks, step: 1 };
  const raw = max / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step =
    ([1, 2, 2.5, 5, 10].find((multiplier) => multiplier * magnitude >= raw) ?? 10) * magnitude;
  return { max: step * Math.ceil(max / step), step };
}

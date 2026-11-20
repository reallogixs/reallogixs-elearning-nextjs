import type { ReactElement } from "react";

import type { Stat } from "@/types/domain";
import { cn } from "@/lib/cn";

/** Numbers in one card, split by hairlines (2×2 on phones, one row on desktop). */
export function StatsStrip({ stats }: { stats: Stat[] }): ReactElement {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-line bg-white/80 shadow-card backdrop-blur lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col gap-1 p-5 sm:p-6",
            index % 2 === 1 && "border-l border-line",
            index >= 2 && "border-t border-line lg:border-t-0",
            index === 2 && "lg:border-l",
          )}
        >
          <dt className="order-2 text-small text-ink-soft">{stat.label}</dt>
          <dd className="order-1 font-display text-h2 font-semibold">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

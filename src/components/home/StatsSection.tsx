"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { Counter } from "@/components/ui/Counter";
import { Section } from "@/components/ui/Section";

import { ContentHeading } from "./ContentHeading";

/** "1,200+" → 1200 and "+"; "4.8/5" → 4.8 and "/5". Text that isn't a number shows as is. */
function parseStat(value: string): { number: number; prefix: string; suffix: string } | null {
  const match = /^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!match) return null;
  return {
    prefix: match[1] ?? "",
    number: Number((match[2] ?? "").replace(/,/g, "")),
    suffix: match[3] ?? "",
  };
}

/** Big count-up numbers on white (main site M9). Values are admin-managed. */
export function StatsSection(): ReactElement {
  const { stats, sections } = useDb().content;
  return (
    <Section labelledBy="stats-title">
      <ContentHeading id="stats-title" copy={sections.stats} />
      <dl className="grid gap-x-6 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const parsed = parseStat(stat.value);
          return (
            <div key={stat.label} className="flex flex-col-reverse gap-2">
              <dt className="text-ink-soft">{stat.label}</dt>
              <dd className="font-display text-display text-navy-900">
                {parsed ? (
                  <Counter value={parsed.number} prefix={parsed.prefix} suffix={parsed.suffix} />
                ) : (
                  stat.value
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Section>
  );
}

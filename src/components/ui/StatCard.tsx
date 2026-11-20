import type { ReactElement, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { Sparkline } from "@/components/charts/Sparkline";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  /** Signed % change against the named period. */
  delta?: { value: number; period: string };
  /** Last N buckets, oldest first. */
  trend?: number[];
  tone?: "light" | "dark";
}

/** KPI tile: icon chip, label, value, optional change and sparkline. */
export function StatCard({
  label,
  value,
  icon,
  hint,
  delta,
  trend,
  tone = "light",
}: StatCardProps): ReactElement {
  const dark = tone === "dark";
  const up = (delta?.value ?? 0) >= 0;
  return (
    <div
      className={cn(
        "@container flex min-w-0 flex-col gap-4 rounded-md border p-5",
        dark
          ? "on-dark border-transparent bg-mesh text-white"
          : "border-line/80 bg-white shadow-soft",
      )}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-sm [&>svg]:size-[18px]",
              dark ? "bg-white/12 text-sky-300" : "bg-sky-100 text-teal-700",
            )}
          >
            {icon}
          </span>
        ) : null}
        <p className={cn("text-small font-medium", dark ? "text-on-dark" : "text-ink-soft")}>
          {label}
        </p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-dash-kpi">{value}</p>
          {delta ? (
            <p
              className={cn(
                "flex items-center gap-1 text-dash-meta",
                dark ? "text-on-dark" : up ? "text-success-text" : "text-error-text",
              )}
            >
              {up ? (
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              ) : (
                <ArrowDownRight aria-hidden="true" className="size-3.5" />
              )}
              <span>
                {up ? "+" : ""}
                {delta.value}%{" "}
                <span className={dark ? "" : "text-ink-soft"}>vs {delta.period}</span>
              </span>
            </p>
          ) : hint ? (
            <p
              className={cn("text-dash-meta font-normal", dark ? "text-on-dark" : "text-ink-soft")}
            >
              {hint}
            </p>
          ) : null}
        </div>
        {trend && !dark ? (
          <Sparkline values={trend} className="hidden shrink-0 @[17rem]:block" />
        ) : null}
      </div>
    </div>
  );
}

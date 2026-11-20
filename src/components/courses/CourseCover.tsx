import type { ReactElement } from "react";

import type { CourseMode } from "@/types/domain";
import { cn } from "@/lib/cn";
import { CircuitLine } from "@/components/brand/CircuitLine";

import { MODE_LABEL } from "./courseLabels";

const VARIANTS = ["bg-mesh", "bg-gradient-deep", "bg-gradient-logic"] as const;

function hash(value: string): number {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

interface CourseCoverProps {
  title: string;
  category?: string;
  mode: CourseMode;
  className?: string;
}

/** Branded placeholder artwork until course images come from Cloudinary. Decorative. */
export function CourseCover({ title, category, mode, className }: CourseCoverProps): ReactElement {
  const variant = VARIANTS[hash(title) % VARIANTS.length];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "on-dark relative isolate flex aspect-[2/1] flex-col justify-between overflow-hidden p-4 text-white sm:aspect-[16/9]",
        variant,
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 bg-grid-dark" />
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-pill glass px-3 py-1 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
          {category ?? "Course"}
        </span>
        <span className="rounded-pill bg-white px-3 py-1 text-[0.75rem] font-medium text-navy-900">
          {MODE_LABEL[mode]}
        </span>
      </div>
      <CircuitLine className="text-sky-300 opacity-60 transition-transform duration-slow ease-out-expo group-hover:translate-x-3" />
    </div>
  );
}

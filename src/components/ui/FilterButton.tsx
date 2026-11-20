import type { ReactElement } from "react";
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/cn";

interface FilterButtonProps {
  count: number;
  expanded: boolean;
  onClick: () => void;
  className?: string;
}

/** Opens a filter drawer on small screens; shows how many filters are on. */
export function FilterButton({
  count,
  expanded,
  onClick,
  className,
}: FilterButtonProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={cn(
        "inline-flex h-12 shrink-0 items-center gap-2 rounded-sm border border-line bg-white px-4 text-small font-medium text-ink hover:border-navy-600/45",
        className,
      )}
    >
      <SlidersHorizontal aria-hidden="true" className="size-4" />
      Filters
      {count > 0 ? (
        <span className="flex size-5 items-center justify-center rounded-pill bg-navy-900 text-[0.6875rem] text-white">
          {count}
          <span className="sr-only"> active</span>
        </span>
      ) : null}
    </button>
  );
}

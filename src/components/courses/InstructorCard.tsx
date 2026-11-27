import type { ReactElement } from "react";

import type { Instructor } from "@/types/domain";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/domain/format";

/** Same height in a grid: the bio is cut to four lines. */
export function InstructorCard({
  instructor,
  className,
}: {
  instructor: Instructor;
  className?: string;
}): ReactElement {
  return (
    <div
      className={cn("flex min-h-40 gap-4 rounded-md border border-line bg-white p-5", className)}
    >
      <span
        aria-hidden="true"
        className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-gradient-logic font-display text-h4 text-white"
      >
        {initials(instructor.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-display text-h4">{instructor.name}</p>
        <p className="text-small text-teal-700">{instructor.title}</p>
        <p className="mt-1 line-clamp-4 text-small text-ink-soft" title={instructor.bio}>
          {instructor.bio}
        </p>
      </div>
    </div>
  );
}

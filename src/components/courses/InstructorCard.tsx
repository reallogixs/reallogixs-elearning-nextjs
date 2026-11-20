import type { ReactElement } from "react";

import type { Instructor } from "@/types/domain";
import { initials } from "@/lib/domain/format";

export function InstructorCard({ instructor }: { instructor: Instructor }): ReactElement {
  return (
    <div className="flex gap-4 rounded-md border border-line p-5">
      <span
        aria-hidden="true"
        className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-gradient-logic font-display text-h4 text-white"
      >
        {initials(instructor.name)}
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-h4">{instructor.name}</p>
        <p className="text-small text-teal-700">{instructor.title}</p>
        <p className="mt-1 text-small text-ink-soft">{instructor.bio}</p>
      </div>
    </div>
  );
}

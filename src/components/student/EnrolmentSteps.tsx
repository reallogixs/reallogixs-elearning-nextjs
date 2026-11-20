import type { ReactElement } from "react";
import { Check } from "lucide-react";

import type { OrderStatus } from "@/types/domain";
import { cn } from "@/lib/cn";

const STEPS = ["Receipt sent", "Verified", "Community"] as const;

/** Where the enrolment is: how many of the three steps are done (rejected sits at step 1). */
function doneCount(status: OrderStatus): number {
  if (status === "confirmed") return 2;
  if (status === "pending") return 1;
  return 0;
}

export function EnrolmentSteps({ status }: { status: OrderStatus }): ReactElement {
  const done = doneCount(status);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Enrolment progress">
      {STEPS.map((step, index) => {
        const complete = index < done;
        const current = index === done && status !== "cancelled";
        return (
          <li key={step} className="flex flex-col gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-pill",
                complete ? "bg-chart-1" : current ? "bg-sky-300/60" : "bg-line",
              )}
            />
            <span
              className={cn(
                "flex items-center gap-1 text-dash-meta",
                complete ? "text-ink" : "text-ink-soft",
              )}
            >
              {complete ? <Check aria-hidden="true" className="size-3.5 text-teal-700" /> : null}
              {step}
              <span className="sr-only">
                {complete ? " (done)" : current ? " (current step)" : " (to do)"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

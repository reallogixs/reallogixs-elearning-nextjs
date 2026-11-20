import type { ReactElement } from "react";

import type { EnrolmentState } from "@/lib/domain/orders";
import { ENROLMENT_LABEL } from "@/lib/domain/orders";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const TONE: Record<EnrolmentState, BadgeTone> = {
  open: "success",
  full: "danger",
  closed: "neutral",
  started: "warning",
};

export function EnrolmentBadge({
  state,
  seatsLeft,
  className,
}: {
  state: EnrolmentState;
  className?: string;
  seatsLeft: number;
}): ReactElement {
  if (state === "open" && seatsLeft <= 5)
    return (
      <Badge tone="warning" className={className}>
        {seatsLeft === 1 ? "1 seat left" : `${seatsLeft} seats left`}
      </Badge>
    );
  return (
    <Badge tone={TONE[state]} className={className}>
      {ENROLMENT_LABEL[state]}
    </Badge>
  );
}

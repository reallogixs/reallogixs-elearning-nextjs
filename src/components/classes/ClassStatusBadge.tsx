import type { ReactElement } from "react";
import { CalendarClock, CircleCheck, CircleStop, Radio } from "lucide-react";

import type { Meeting } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";

export function ClassStatusBadge({
  meeting,
}: {
  meeting: Pick<Meeting, "status" | "completedAt">;
}): ReactElement {
  if (meeting.completedAt)
    return (
      <Badge tone="success" icon={<CircleCheck />}>
        Completed
      </Badge>
    );
  if (meeting.status === "live")
    return (
      <Badge tone="danger" icon={<Radio />}>
        Live now
      </Badge>
    );
  if (meeting.status === "ended")
    return (
      <Badge tone="warning" icon={<CircleStop />}>
        Ended, not completed
      </Badge>
    );
  return (
    <Badge tone="info" icon={<CalendarClock />}>
      Scheduled
    </Badge>
  );
}

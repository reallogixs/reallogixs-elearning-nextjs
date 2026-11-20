import type { ReactElement } from "react";
import { Ban, CircleCheck, CircleX, Clock } from "lucide-react";

import { SegmentedBar } from "@/components/charts/SegmentedBar";

import type { AdminMetrics } from "./dashboardData";

/** Orders split by status. Status colours are reserved and always paired with an icon. */
export function OrderStatusSegments({
  counts,
}: {
  counts: AdminMetrics["statusCounts"];
}): ReactElement {
  return (
    <SegmentedBar
      label="Orders by status"
      segments={[
        {
          key: "confirmed",
          label: "Confirmed",
          value: counts.confirmed,
          color: "var(--rl-success)",
          ink: "var(--rl-success-text)",
          icon: <CircleCheck />,
        },
        {
          key: "pending",
          label: "Awaiting verification",
          value: counts.pending,
          color: "var(--rl-warning)",
          ink: "var(--rl-warning-text)",
          icon: <Clock />,
        },
        {
          key: "rejected",
          label: "Receipt rejected",
          value: counts.rejected,
          color: "var(--rl-error)",
          ink: "var(--rl-error-text)",
          icon: <CircleX />,
        },
        {
          key: "cancelled",
          label: "Cancelled",
          value: counts.cancelled,
          color: "var(--rl-on-dark-soft)",
          ink: "var(--rl-ink-soft)",
          icon: <Ban />,
        },
      ]}
    />
  );
}

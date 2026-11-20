import type { ReactElement } from "react";
import { CircleCheck, CircleX, Clock, Ban } from "lucide-react";

import type { OrderStatus } from "@/types/domain";
import { ORDER_STATUS_LABEL } from "@/lib/domain/orders";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const STYLE: Record<OrderStatus, { tone: BadgeTone; icon: ReactElement }> = {
  pending: { tone: "warning", icon: <Clock /> },
  rejected: { tone: "danger", icon: <CircleX /> },
  confirmed: { tone: "success", icon: <CircleCheck /> },
  cancelled: { tone: "neutral", icon: <Ban /> },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }): ReactElement {
  const { tone, icon } = STYLE[status];
  return (
    <Badge tone={tone} icon={icon}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

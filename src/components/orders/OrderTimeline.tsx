import type { ReactElement } from "react";

import type { OrderEvent } from "@/types/domain";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/domain/format";
import { ORDER_STATUS_LABEL } from "@/lib/domain/orders";

const LABEL: Record<OrderEvent["status"], string> = {
  ...ORDER_STATUS_LABEL,
  pending: "Receipt submitted",
  receipt_uploaded: "New receipt uploaded",
};

export function OrderTimeline({ events }: { events: OrderEvent[] }): ReactElement {
  const visible = events.filter(
    (event, index) =>
      !(event.status === "pending" && events[index - 1]?.status === "receipt_uploaded"),
  );
  return (
    <ol className="flex flex-col gap-4 border-l border-line pl-5">
      {visible.map((event, index) => (
        <li key={`${event.at}-${index}`} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1.5 -left-[25px] size-2.5 rounded-pill border-2 border-white",
              index === visible.length - 1 ? "bg-sky-400" : "bg-line",
            )}
          />
          <p className="text-small font-medium">{LABEL[event.status]}</p>
          <p className="text-small text-ink-soft">{formatDateTime(event.at)}</p>
          {event.note ? <p className="mt-1 text-small text-ink-soft">“{event.note}”</p> : null}
        </li>
      ))}
    </ol>
  );
}

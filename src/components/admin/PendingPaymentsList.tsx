"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

import type { Order } from "@/types/domain";
import { formatDateTime, formatPKR } from "@/lib/domain/format";
import { courseById } from "@/lib/portal/selectors";
import { usePortalData } from "@/components/data/PortalData";
import { UserAvatar } from "@/components/portal/UserAvatar";

export function PendingPaymentsList({ orders }: { orders: Order[] }): ReactElement {
  const db = usePortalData();
  if (orders.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-sm bg-success/10 px-4 py-3 text-small text-success-text">
        <CircleCheck aria-hidden="true" className="size-4" /> All caught up. No receipts waiting.
      </p>
    );
  }
  return (
    <ul className="-mx-2 flex flex-col">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/payments?order=${order.id}`}
            className="flex items-center gap-3 rounded-sm px-2 py-2.5 transition-colors hover:bg-canvas"
          >
            <UserAvatar name={order.contact.name} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-small font-semibold">{order.contact.name}</span>
              <span className="block truncate text-dash-meta font-normal text-ink-soft">
                {courseById(db, order.courseId)?.title} · {formatDateTime(order.updatedAt)}
              </span>
            </span>
            <span className="shrink-0 text-small font-semibold tabular-nums">
              {formatPKR(order.price.total)}
            </span>
            <span className="hidden shrink-0 rounded-pill border border-line px-3 py-1 text-dash-meta text-ink sm:inline">
              Review
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

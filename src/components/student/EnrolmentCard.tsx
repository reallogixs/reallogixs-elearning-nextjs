import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, MonitorPlay } from "lucide-react";

import type { CatalogueCourse } from "@/types/catalogue";
import type { Order } from "@/types/domain";
import { formatDateTime, formatPKR } from "@/lib/domain/format";
import { MODE_LABEL } from "@/components/courses/courseLabels";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import { EnrolmentSteps } from "./EnrolmentSteps";

const NEXT_ACTION: Record<Order["status"], string> = {
  pending: "View order",
  rejected: "Re-upload receipt",
  confirmed: "Class & community",
  cancelled: "View order",
};

export function EnrolmentCard({
  order,
  course,
}: {
  order: Order;
  course?: CatalogueCourse;
}): ReactElement {
  const ModeIcon = course?.mode === "physical" ? MapPin : MonitorPlay;
  return (
    <article className="group relative flex flex-col gap-5 rounded-md border border-line/80 bg-white p-5 shadow-soft transition-[border-color,box-shadow] hover:border-sky-300 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <OrderStatusBadge status={order.status} />
        <span className="font-mono text-dash-meta text-ink-soft">{order.id}</span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-dash-heading">
          <Link
            href={`/student/orders/${order.id}`}
            className="group-has-[:focus-visible]:underline after:absolute after:inset-0 focus-visible:outline-none"
          >
            {course?.title ?? "Course"}
          </Link>
        </h2>
        {course ? (
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-dash-meta font-normal text-ink-soft">
            <span className="flex items-center gap-1.5">
              <ModeIcon aria-hidden="true" className="size-3.5" />
              {MODE_LABEL[course.mode]}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              {formatDateTime(course.startsAt)}
            </span>
          </p>
        ) : null}
      </div>
      <EnrolmentSteps status={order.status} />
      <div className="mt-auto flex items-center justify-between border-t border-line/80 pt-4">
        <span className="text-small font-semibold tabular-nums">
          {formatPKR(order.price.total)}
        </span>
        <span className="flex items-center gap-1 text-small font-semibold text-teal-700">
          {NEXT_ACTION[order.status]}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </article>
  );
}

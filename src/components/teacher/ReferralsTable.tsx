import type { ReactElement } from "react";
import { Users } from "lucide-react";

import type { Database, Order } from "@/types/domain";
import { formatDate, formatPKR } from "@/lib/domain/format";
import { courseById } from "@/lib/store/selectors";
import { UserAvatar } from "@/components/portal/UserAvatar";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";

/** Teachers see the student's name and course only, not their contact details. */
export function ReferralsTable({ db, orders }: { db: Database; orders: Order[] }): ReactElement {
  return (
    <DataTable
      caption="Students who used your code"
      rows={orders}
      rowKey={(order) => order.id}
      empty={
        <EmptyState
          icon={<Users className="size-5" />}
          title="No referrals yet"
          body="Share your promo code with students. Their enrolments appear here."
        />
      }
      columns={[
        {
          key: "student",
          header: "Student",
          cell: (order) => (
            <span className="flex items-center gap-2.5">
              <UserAvatar name={order.contact.name} size="sm" />
              <span className="font-semibold">{order.contact.name}</span>
            </span>
          ),
        },
        {
          key: "course",
          header: "Course",
          wrap: true,
          cell: (order) => courseById(db, order.courseId)?.title ?? "—",
        },
        {
          key: "date",
          header: "Date",
          hideBelow: "md",
          cell: (order) => formatDate(order.createdAt),
        },
        {
          key: "status",
          header: "Status",
          cell: (order) => <OrderStatusBadge status={order.status} />,
        },
        {
          key: "commission",
          header: "Your commission",
          className: "text-right",
          cell: (order) =>
            order.commission
              ? `${formatPKR(order.commission.amount)} (${order.commission.pct}%)`
              : "—",
        },
      ]}
    />
  );
}

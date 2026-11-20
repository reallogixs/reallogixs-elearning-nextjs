"use client";

import type { ReactElement } from "react";
import { ShoppingBag } from "lucide-react";

import type { Order } from "@/types/domain";
import { formatDate, formatPKR } from "@/lib/domain/format";
import { useDb } from "@/lib/store/hooks";
import { courseById, paymentMethodById } from "@/lib/store/selectors";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";

export function OrdersTable({
  orders,
  onOpen,
  caption,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
  caption: string;
}): ReactElement {
  const db = useDb();
  return (
    <DataTable
      caption={caption}
      rows={orders}
      rowKey={(order) => order.id}
      empty={<EmptyState icon={<ShoppingBag className="size-5" />} title="No orders here" />}
      columns={[
        {
          key: "order",
          header: "Order",
          cell: (order) => (
            <button
              type="button"
              onClick={() => onOpen(order.id)}
              className="min-h-11 text-left font-mono font-medium text-teal-700 underline-offset-2 hover:underline"
            >
              {order.id}
            </button>
          ),
        },
        {
          key: "student",
          header: "Student",
          cell: (order) => <span className="font-medium">{order.contact.name}</span>,
        },
        {
          key: "course",
          header: "Course",
          hideBelow: "xl",
          wrap: true,
          className: "min-w-48",
          cell: (order) => courseById(db, order.courseId)?.title ?? "—",
        },
        {
          key: "method",
          header: "Method",
          hideBelow: "xl",
          mobile: "hidden",
          cell: (order) => paymentMethodById(db, order.paymentMethodId)?.name ?? "—",
        },
        {
          key: "date",
          header: "Updated",
          hideBelow: "xl",
          mobile: "hidden",
          cell: (order) => formatDate(order.updatedAt),
        },
        { key: "amount", header: "Amount", cell: (order) => formatPKR(order.price.total) },
        {
          key: "status",
          header: "Status",
          cell: (order) => <OrderStatusBadge status={order.status} />,
        },
      ]}
    />
  );
}

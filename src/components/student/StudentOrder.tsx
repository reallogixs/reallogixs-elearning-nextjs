"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { ordersForStudent } from "@/lib/store/selectors";
import { useStudent } from "@/lib/store/useRoleUser";
import { OrderStatusPanel } from "@/components/orders/OrderStatusPanel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";

export function StudentOrder({ orderId }: { orderId: string }): ReactElement | null {
  const db = useDb();
  const student = useStudent();
  if (!student) return null;
  const owns = ordersForStudent(db, student).some((order) => order.id === orderId);
  return (
    <>
      <Breadcrumbs items={[{ label: "My courses", href: "/student" }, { label: orderId }]} />
      {owns ? (
        <OrderStatusPanel orderId={orderId} />
      ) : (
        <EmptyState title="Order not found" body="This order isn't linked to your account." />
      )}
    </>
  );
}

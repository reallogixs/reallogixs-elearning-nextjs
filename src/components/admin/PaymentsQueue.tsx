"use client";

import type { ReactElement } from "react";

import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";

import { OrderReviewModal } from "./OrderReviewModal";
import { OrdersTable } from "./OrdersTable";
import { useOrderParam } from "./useOrderParam";

export function PaymentsQueue(): ReactElement {
  const db = usePortalData();
  const [openId, setOpenId] = useOrderParam();
  const pending = db.orders
    .filter((order) => order.status === "pending")
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  return (
    <>
      <PageHeader
        title="Verify payments"
        description="Oldest first. Open an order, check the receipt against the amount, then confirm or reject."
      />
      <OrdersTable caption="Orders awaiting verification" orders={pending} onOpen={setOpenId} />
      <OrderReviewModal orderId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

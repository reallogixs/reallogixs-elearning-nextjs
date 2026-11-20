"use client";

import { useState, type ReactElement } from "react";

import type { OrderStatus } from "@/types/domain";
import { useDb } from "@/lib/store/hooks";
import { byNewest } from "@/lib/store/selectors";
import { PageHeader } from "@/components/portal/PageHeader";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { Input } from "@/components/ui/Input";

import { OrderReviewModal } from "./OrderReviewModal";
import { OrdersTable } from "./OrdersTable";
import { useOrderParam } from "./useOrderParam";

type Filter = OrderStatus | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export function AllOrders(): ReactElement {
  const db = useDb();
  const [openId, setOpenId] = useOrderParam();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const orders = db.orders
    .filter((order) => filter === "all" || order.status === filter)
    .filter(
      (order) =>
        !needle ||
        `${order.id} ${order.contact.name} ${order.contact.email} ${order.contact.phone} ${order.promoCode ?? ""}`
          .toLowerCase()
          .includes(needle),
    )
    .sort(byNewest);

  return (
    <>
      <PageHeader title="All orders" description="Every enrolment, with receipts and history." />
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ChipGroup
          variant="segmented"
          label="Filter by status"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
        <Input
          type="search"
          aria-label="Search orders"
          placeholder="Search name, phone, order or code"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="xl:w-80"
        />
      </div>
      <OrdersTable caption="All orders" orders={orders} onOpen={setOpenId} />
      <OrderReviewModal orderId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

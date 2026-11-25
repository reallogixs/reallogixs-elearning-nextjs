"use client";

import { useState, type ReactElement } from "react";
import { Search } from "lucide-react";

import type { OrderStatus } from "@/types/domain";
import { byNewest } from "@/lib/portal/selectors";
import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { Drawer } from "@/components/ui/Drawer";
import { FilterButton } from "@/components/ui/FilterButton";
import { FilterChip } from "@/components/ui/FilterChip";
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
  const db = usePortalData();
  const [openId, setOpenId] = useOrderParam();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const filterLabel = FILTERS.find((option) => option.value === filter)?.label ?? "All";

  return (
    <>
      <PageHeader title="All orders" description="Every enrolment, with receipts and history." />
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="hidden xl:block">
          <ChipGroup
            variant="segmented"
            label="Filter by status"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </div>
        <div className="flex gap-2 xl:w-80">
          <FilterButton
            count={filter === "all" ? 0 : 1}
            expanded={filtersOpen}
            onClick={() => setFiltersOpen(true)}
            className="xl:hidden"
          />
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft"
            />
            <Input
              type="search"
              aria-label="Search orders"
              placeholder="Name, phone, order or code"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-11"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <p aria-live="polite" className="mr-1 text-small text-ink-soft">
          {orders.length === 1 ? "1 order" : `${orders.length} orders`}
        </p>
        {filter !== "all" ? (
          <FilterChip label={filterLabel} onRemove={() => setFilter("all")} />
        ) : null}
      </div>
      <OrdersTable caption="All orders" orders={orders} onOpen={setOpenId} />
      <OrderReviewModal orderId={openId} onClose={() => setOpenId(null)} />
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        side="left"
        footer={
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            Show {orders.length} orders
          </Button>
        }
      >
        <div className="flex flex-col gap-3 p-5">
          <p className="text-small font-semibold">Status</p>
          <ChipGroup
            variant="list"
            label="Filter by status"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </div>
      </Drawer>
    </>
  );
}

"use client";

import { useMemo, type ReactElement } from "react";
import { BadgeDollarSign, Clock, GraduationCap, Plus, Wallet } from "lucide-react";

import { formatCompactPKR, formatPKR } from "@/lib/domain/format";
import { useNow } from "@/lib/useNow";
import { usePortalData } from "@/components/data/PortalData";
import { AreaChart } from "@/components/charts/AreaChart";
import { DashCard } from "@/components/portal/DashCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { UserAvatar } from "@/components/portal/UserAvatar";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";

import { BarList } from "./BarList";
import { adminMetrics, WEEKS } from "./dashboardData";
import { OrderStatusSegments } from "./OrderStatusSegments";
import { PendingPaymentsList } from "./PendingPaymentsList";

export function AdminDashboard(): ReactElement {
  const db = usePortalData();
  const now = useNow();
  const metrics = useMemo(() => adminMetrics(db, now), [db, now]);
  const pending = db.orders
    .filter((order) => order.status === "pending")
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Academy performance over the last ${WEEKS} weeks.`}
        actions={
          <>
            <Button href="/admin/payments" variant="secondary" size="sm">
              Verify payments
            </Button>
            <Button href="/admin/courses/new" size="sm" icon={<Plus className="size-4" />}>
              New course
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Confirmed revenue"
          value={formatPKR(metrics.revenueTotal)}
          icon={<BadgeDollarSign />}
          delta={
            metrics.revenueChange === null
              ? undefined
              : { value: metrics.revenueChange, period: "prior 4 wks" }
          }
          trend={metrics.revenue.map((point) => point.value)}
        />
        <StatCard
          label="New enrolments"
          value={metrics.enrolmentTotal}
          icon={<GraduationCap />}
          delta={
            metrics.enrolmentChange === null
              ? undefined
              : { value: metrics.enrolmentChange, period: "prior 4 wks" }
          }
          trend={metrics.enrolments.map((point) => point.value)}
        />
        <StatCard
          label="Awaiting verification"
          value={metrics.pendingCount}
          icon={<Clock />}
          hint={metrics.pendingCount ? "Receipts to check" : "All caught up"}
        />
        <StatCard
          label="Commission due"
          value={formatPKR(metrics.commissionDue)}
          icon={<Wallet />}
          hint="Owed to teachers"
          tone="dark"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashCard
          title="Revenue"
          description="Confirmed payments per week"
          className="xl:col-span-2"
        >
          <AreaChart
            label="Confirmed revenue per week"
            points={metrics.revenue}
            formatValue={formatPKR}
            formatTick={formatCompactPKR}
          />
        </DashCard>
        <DashCard title="Orders by status" description="All time">
          <OrderStatusSegments counts={metrics.statusCounts} />
        </DashCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashCard
          title="Payments to verify"
          description="Oldest first"
          action={
            <Button href="/admin/payments" variant="ghost" size="sm" arrow>
              Open queue
            </Button>
          }
        >
          <PendingPaymentsList orders={pending.slice(0, 5)} />
        </DashCard>
        <DashCard title="Seats filled" description="Confirmed enrolments against seats, per class">
          <BarList
            items={metrics.seats.map((row) => ({ ...row, display: `${row.value} / ${row.max}` }))}
          />
        </DashCard>
      </div>

      <DashCard title="Top referring teachers" description="By commission earned">
        {metrics.topTeachers.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.topTeachers.map((teacher, index) => (
              <li
                key={teacher.id}
                className="flex items-center gap-3 rounded-sm border border-line/80 p-3"
              >
                <span className="w-5 text-dash-meta text-ink-soft tabular-nums">{index + 1}</span>
                <UserAvatar name={teacher.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-small font-semibold">{teacher.name}</span>
                  <span className="block text-dash-meta font-normal text-ink-soft">
                    {teacher.confirmed} enrolments
                  </span>
                </span>
                <span className="text-small font-semibold tabular-nums">
                  {formatPKR(teacher.earned)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-ink-soft">No confirmed referrals yet.</p>
        )}
      </DashCard>
    </>
  );
}

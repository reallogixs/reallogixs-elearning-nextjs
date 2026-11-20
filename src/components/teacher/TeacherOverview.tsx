"use client";

import { useMemo, type ReactElement } from "react";
import { Clock, HandCoins, Users, Wallet } from "lucide-react";

import { confirmedAt, periodChange, weeklySeries } from "@/lib/domain/analytics";
import { formatCompactPKR, formatPKR } from "@/lib/domain/format";
import { useDb } from "@/lib/store/hooks";
import { byNewest, ordersForTeacher, teacherSummary } from "@/lib/store/selectors";
import { useTeacher } from "@/lib/store/useRoleUser";
import { useNow } from "@/lib/useNow";
import { AreaChart } from "@/components/charts/AreaChart";
import { DashCard } from "@/components/portal/DashCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";

import { PromoCodeCard } from "./PromoCodeCard";
import { ReferralsTable } from "./ReferralsTable";

const WEEKS = 12;

export function TeacherOverview(): ReactElement | null {
  const db = useDb();
  const teacher = useTeacher();
  const now = useNow();
  const orders = useMemo(() => (teacher ? ordersForTeacher(db, teacher.id) : []), [db, teacher]);
  const earnings = useMemo(
    () =>
      weeklySeries(
        orders,
        now,
        WEEKS,
        (order) => (order.status === "confirmed" ? confirmedAt(order) : null),
        (order) => order.commission?.amount ?? 0,
      ),
    [orders, now],
  );
  if (!teacher) return null;
  const summary = teacherSummary(db, teacher.id);
  const change = periodChange(earnings, 4);
  const recent = [...orders].sort(byNewest).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${teacher.name.split(" ")[0]}`}
        description="Your referrals and earnings at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
        <PromoCodeCard teacher={teacher} className="sm:col-span-2 xl:col-span-1" />
        <StatCard
          label="Due to you"
          value={formatPKR(summary.due)}
          icon={<Wallet />}
          hint={`${formatPKR(summary.paid)} paid so far`}
        />
        <StatCard
          label="Total earned"
          value={formatPKR(summary.earned)}
          icon={<HandCoins />}
          delta={change === null ? undefined : { value: change, period: "prior 4 wks" }}
          trend={earnings.map((point) => point.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Students referred"
          value={summary.referrals}
          icon={<Users />}
          hint={`${summary.confirmed} confirmed`}
        />
        <StatCard
          label="Awaiting verification"
          value={summary.pending}
          icon={<Clock />}
          hint="Earn once the admin confirms"
        />
      </div>
      <DashCard title="Commission earned" description={`Per week, last ${WEEKS} weeks`}>
        <AreaChart
          label="Commission earned per week"
          points={earnings}
          formatValue={formatPKR}
          formatTick={formatCompactPKR}
          height={220}
        />
      </DashCard>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-dash-heading">Recent referrals</h2>
          <Button href="/teacher/students" variant="ghost" size="sm" arrow>
            See all
          </Button>
        </div>
        <ReferralsTable db={db} orders={recent} />
      </div>
    </>
  );
}

"use client";

import type { ReactElement } from "react";
import { Wallet } from "lucide-react";

import { formatDate, formatPKR } from "@/lib/domain/format";
import { courseById, teacherSummary, unpaidCommissions } from "@/lib/portal/selectors";
import { useTeacher } from "@/lib/account/useRoleUser";
import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

export function TeacherEarnings(): ReactElement | null {
  const db = usePortalData();
  const teacher = useTeacher();
  if (!teacher) return null;
  const summary = teacherSummary(db, teacher.id);
  const due = unpaidCommissions(db.orders, teacher.id);
  const payouts = db.payouts.filter((payout) => payout.teacherId === teacher.id);

  return (
    <>
      <PageHeader
        title="Earnings"
        description="Commission is earned when the admin confirms a referred student's payment."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={formatPKR(summary.earned)} />
        <StatCard label="Paid out" value={formatPKR(summary.paid)} />
        <StatCard label="Due to you" value={formatPKR(summary.due)} tone="dark" />
      </div>
      <h2 className="text-h4">Unpaid commission</h2>
      <DataTable
        caption="Commission not yet paid"
        rows={due}
        rowKey={(order) => order.id}
        empty={<EmptyState icon={<Wallet className="size-5" />} title="Nothing due right now" />}
        columns={[
          { key: "student", header: "Student", cell: (order) => order.contact.name },
          {
            key: "course",
            header: "Course",
            cell: (order) => courseById(db, order.courseId)?.title ?? "—",
          },
          {
            key: "amount",
            header: "Commission",
            className: "text-right",
            cell: (order) => formatPKR(order.commission?.amount ?? 0),
          },
        ]}
      />
      <h2 className="text-h4">Payout history</h2>
      <DataTable
        caption="Payouts received"
        rows={payouts}
        rowKey={(payout) => payout.id}
        empty={<EmptyState title="No payouts yet" />}
        columns={[
          { key: "date", header: "Paid on", cell: (payout) => formatDate(payout.paidAt) },
          {
            key: "ref",
            header: "Reference",
            cell: (payout) => <span className="font-mono">{payout.reference}</span>,
          },
          {
            key: "count",
            header: "Referrals",
            hideBelow: "md",
            cell: (payout) => payout.orderIds.length,
          },
          {
            key: "amount",
            header: "Amount",
            className: "text-right",
            cell: (payout) => formatPKR(payout.amount),
          },
        ]}
      />
    </>
  );
}

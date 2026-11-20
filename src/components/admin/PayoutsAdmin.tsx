"use client";

import { useState, type ReactElement } from "react";

import { Form, Formik } from "formik";

import type { TeacherUser } from "@/types/domain";
import { teachersApi } from "@/lib/api";
import { formatDate, formatPKR } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { teacherSummary, teachers } from "@/lib/store/selectors";
import { payoutSchema } from "@/lib/validation/admin";
import { PageHeader } from "@/components/portal/PageHeader";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

export function PayoutsAdmin(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const [paying, setPaying] = useState<TeacherUser | null>(null);
  const rows = teachers(db).map((teacher) => ({
    teacher,
    summary: teacherSummary(db, teacher.id),
  }));
  const teacherName = (id: string): string => db.users.find((user) => user.id === id)?.name ?? "—";

  async function pay(reference: string): Promise<void> {
    if (!paying) return;
    const result = await run(
      "pay",
      () => teachersApi.payTeacher(paying.id, reference),
      "Payout recorded.",
    );
    if (result.ok) setPaying(null);
  }

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Commission becomes due when a referred payment is confirmed. Pay teachers outside the app, then record it here."
      />
      <DataTable
        caption="Commission by teacher"
        rows={rows}
        rowKey={(row) => row.teacher.id}
        columns={[
          {
            key: "name",
            header: "Teacher",
            cell: (row) => <span className="font-medium">{row.teacher.name}</span>,
          },
          {
            key: "earned",
            header: "Earned",
            hideBelow: "md",
            cell: (row) => formatPKR(row.summary.earned),
          },
          {
            key: "paid",
            header: "Paid",
            hideBelow: "md",
            cell: (row) => formatPKR(row.summary.paid),
          },
          {
            key: "due",
            header: "Due",
            cell: (row) => <span className="font-medium">{formatPKR(row.summary.due)}</span>,
          },
          {
            key: "action",
            header: "Action",
            className: "text-right",
            cell: (row) => (
              <Button
                size="sm"
                variant="secondary"
                disabled={row.summary.due === 0}
                onClick={() => setPaying(row.teacher)}
              >
                Mark as paid
              </Button>
            ),
          },
        ]}
      />
      <h2 className="text-h4">Payout history</h2>
      <DataTable
        caption="Payout history"
        rows={db.payouts}
        rowKey={(payout) => payout.id}
        empty={<EmptyState title="No payouts yet" />}
        columns={[
          { key: "date", header: "Date", cell: (payout) => formatDate(payout.paidAt) },
          { key: "teacher", header: "Teacher", cell: (payout) => teacherName(payout.teacherId) },
          {
            key: "ref",
            header: "Reference",
            hideBelow: "md",
            cell: (payout) => <span className="font-mono">{payout.reference}</span>,
          },
          {
            key: "orders",
            header: "Orders",
            hideBelow: "lg",
            cell: (payout) => payout.orderIds.join(", "),
          },
          {
            key: "amount",
            header: "Amount",
            className: "text-right",
            cell: (payout) => formatPKR(payout.amount),
          },
        ]}
      />
      <Modal
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        title={`Pay ${paying?.name ?? ""}`}
        description={
          paying
            ? `${formatPKR(teacherSummary(db, paying.id).due)} for all confirmed, unpaid referrals.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPaying(null)}>
              Cancel
            </Button>
            <Button type="submit" form="payout-form" size="sm" loading={pending === "pay"}>
              Record payout
            </Button>
          </>
        }
      >
        <Formik
          initialValues={{ reference: "" }}
          validationSchema={payoutSchema}
          onSubmit={(values) => pay(payoutSchema.cast(values).reference)}
        >
          <Form noValidate id="payout-form">
            <TextField
              name="reference"
              label="Transfer reference"
              hint="e.g. JazzCash transaction ID or bank reference."
              autoFocus
            />
          </Form>
        </Formik>
      </Modal>
    </>
  );
}

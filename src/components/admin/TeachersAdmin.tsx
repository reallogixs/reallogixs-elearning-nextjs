"use client";

import { useState, type ReactElement } from "react";
import { KeyRound, Pencil, UserPlus } from "lucide-react";

import { teachersApi } from "@/lib/api";
import { formatPKR } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { teacherSummary, teachers } from "@/lib/store/selectors";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";

import { TeacherFormModal, type TeacherDraft } from "./TeacherFormModal";

export function TeachersAdmin(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const [draft, setDraft] = useState<TeacherDraft>(null);

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Referral partners. Set each teacher's commission and student discount."
        actions={
          <Button size="sm" icon={<UserPlus className="size-4" />} onClick={() => setDraft({})}>
            Add teacher
          </Button>
        }
      />
      <DataTable
        caption="Teachers"
        rows={teachers(db)}
        rowKey={(teacher) => teacher.id}
        columns={[
          {
            key: "name",
            header: "Teacher",
            cell: (teacher) => (
              <div>
                <p className="font-medium">{teacher.name}</p>
                <p className="text-ink-soft">{teacher.email}</p>
              </div>
            ),
          },
          {
            key: "code",
            header: "Code",
            cell: (teacher) => <span className="font-mono">{teacher.promoCode}</span>,
          },
          {
            key: "rates",
            header: "Commission / discount",
            hideBelow: "md",
            cell: (teacher) => `${teacher.commissionPct}% / ${teacher.discountPct}%`,
          },
          {
            key: "referrals",
            header: "Confirmed",
            hideBelow: "lg",
            cell: (teacher) => teacherSummary(db, teacher.id).confirmed,
          },
          {
            key: "due",
            header: "Due",
            hideBelow: "md",
            cell: (teacher) => formatPKR(teacherSummary(db, teacher.id).due),
          },
          {
            key: "status",
            header: "Status",
            cell: (teacher) => (
              <Badge tone={teacher.active ? "success" : "neutral"}>
                {teacher.active ? "Active" : "Paused"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (teacher) => (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  loading={pending === teacher.id}
                  onClick={() =>
                    run(
                      teacher.id,
                      () => teachersApi.setTeacherActive(teacher.id, !teacher.active),
                      teacher.active
                        ? "Teacher paused. Their code no longer works."
                        : "Teacher reactivated.",
                    )
                  }
                >
                  {teacher.active ? "Pause" : "Activate"}
                </Button>
                <IconButton
                  label={`Email a new password to ${teacher.name}`}
                  onClick={() =>
                    run(
                      `pw-${teacher.id}`,
                      () => teachersApi.resetTeacherPassword(teacher.id),
                      "New password emailed (see Outbox).",
                    )
                  }
                >
                  <KeyRound className="size-4" />
                </IconButton>
                <IconButton label={`Edit ${teacher.name}`} onClick={() => setDraft({ teacher })}>
                  <Pencil className="size-4" />
                </IconButton>
              </div>
            ),
          },
        ]}
      />
      <TeacherFormModal draft={draft} onClose={() => setDraft(null)} />
    </>
  );
}

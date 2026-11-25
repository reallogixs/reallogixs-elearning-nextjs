"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Pencil, UserPlus } from "lucide-react";

import type { TeacherAccount } from "@/types/account";
import { formatPKR } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { teacherSummary } from "@/lib/portal/selectors";
import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import { sendTeacherLink, setTeacherActive } from "@/server/actions/teachers";

import { TeacherFormModal, type TeacherDraft } from "./TeacherFormModal";

export function TeachersAdmin({ accounts }: { accounts: TeacherAccount[] }): ReactElement {
  const db = usePortalData();
  const { run, pending } = useAction();
  const { notify } = useToast();
  const router = useRouter();
  const [draft, setDraft] = useState<TeacherDraft>(null);

  async function toggle(teacher: TeacherAccount): Promise<void> {
    await run(
      teacher.id,
      () => setTeacherActive({ id: teacher.id, active: !teacher.active }),
      teacher.active
        ? "Teacher paused and signed out. Their code no longer works."
        : "Teacher reactivated.",
    );
    router.refresh();
  }

  async function sendLink(teacher: TeacherAccount): Promise<void> {
    const result = await run(`pw-${teacher.id}`, () => sendTeacherLink({ id: teacher.id }));
    if (result.ok) notify(result.data.notice);
  }

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
        rows={accounts}
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
            hideBelow: "xl",
            cell: (teacher) => `${teacher.commissionPct}% / ${teacher.discountPct}%`,
          },
          {
            key: "referrals",
            header: "Confirmed",
            hideBelow: "2xl",
            cell: (teacher) => teacherSummary(db, teacher.id).confirmed,
          },
          {
            key: "due",
            header: "Due",
            hideBelow: "xl",
            cell: (teacher) => formatPKR(teacherSummary(db, teacher.id).due),
          },
          {
            key: "status",
            header: "Status",
            cell: (teacher) => (
              <Badge tone={teacher.active ? "success" : "neutral"}>
                {!teacher.active ? "Paused" : teacher.invited ? "Invited" : "Active"}
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
                  onClick={() => toggle(teacher)}
                >
                  {teacher.active ? "Pause" : "Activate"}
                </Button>
                <IconButton
                  label={`Email a password link to ${teacher.name}`}
                  onClick={() => sendLink(teacher)}
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

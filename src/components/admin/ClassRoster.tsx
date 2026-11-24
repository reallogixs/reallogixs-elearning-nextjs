"use client";

import { useState, type ReactElement } from "react";
import { AtSign, ExternalLink, Send } from "lucide-react";

import type { Meeting, Registrant } from "@/types/domain";
import { meetingsApi } from "@/lib/api";
import { attended, isInMeeting } from "@/lib/domain/meeting";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { certificateForOrder } from "@/lib/store/selectors";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";

import { RegistrantEmailModal } from "./RegistrantEmailModal";

function Presence({ meeting, orderId }: { meeting: Meeting; orderId: string }): ReactElement {
  if (isInMeeting(meeting, orderId)) return <Badge tone="success">In class</Badge>;
  if (attended(meeting, orderId)) return <Badge tone="info">Attended</Badge>;
  return <Badge>{meeting.status === "ended" ? "Absent" : "Not joined"}</Badge>;
}

/** Paid, confirmed students allowed in, with attendance and certificate. */
export function ClassRoster({ meeting }: { meeting: Meeting }): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const [editing, setEditing] = useState<Registrant | null>(null);
  const open = meeting.status !== "ended";

  return (
    <>
      <DataTable
        caption="Registered students"
        rows={meeting.registrants}
        rowKey={(registrant) => registrant.orderId}
        empty={
          <EmptyState
            title="No one is registered yet"
            body="Students are added automatically when you confirm their payment."
          />
        }
        columns={[
          {
            key: "name",
            header: "Student",
            cell: (row) => <span className="font-semibold">{row.name}</span>,
          },
          { key: "email", header: "Zoom email", wrap: true, cell: (row) => row.email },
          {
            key: "presence",
            header: "Attendance",
            cell: (row) => <Presence meeting={meeting} orderId={row.orderId} />,
          },
          {
            key: "certificate",
            header: "Certificate",
            hideBelow: "xl",
            cell: (row) => certificateForOrder(db, row.orderId)?.code ?? "—",
          },
          ...(open
            ? [
                {
                  key: "actions",
                  header: "Actions",
                  className: "text-right",
                  cell: (row: Registrant) => (
                    <div className="flex justify-end">
                      <IconButton
                        label={`Email the link to ${row.name} again`}
                        disabled={pending === row.orderId}
                        onClick={() =>
                          run(
                            row.orderId,
                            () => meetingsApi.resendInvite(meeting.courseId, row.orderId),
                            "Invite emailed again (see Outbox).",
                          )
                        }
                      >
                        <Send className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Change Zoom email for ${row.name}`}
                        onClick={() => setEditing(row)}
                      >
                        <AtSign className="size-4" />
                      </IconButton>
                      <a
                        href={`/join/${row.joinToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${row.name}'s join page (demo)`}
                        title="Open their join page (demo)"
                        className="inline-flex size-11 items-center justify-center rounded-pill hover:bg-mist"
                      >
                        <ExternalLink aria-hidden="true" className="size-4" />
                      </a>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
      <RegistrantEmailModal
        courseId={meeting.courseId}
        registrant={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

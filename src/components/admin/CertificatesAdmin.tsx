"use client";

import type { ReactElement } from "react";
import { Send } from "lucide-react";

import { meetingsApi } from "@/lib/api";
import { formatDate } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";

/** Certificates are only created by completing a class, so attendance can't be bypassed. */
export function CertificatesAdmin(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Created and emailed automatically when you mark a class completed, to students who attended."
        actions={
          <Button href="/admin/classes" size="sm" variant="secondary" arrow>
            Classes
          </Button>
        }
      />
      <DataTable
        caption="Issued certificates"
        rows={db.certificates}
        rowKey={(certificate) => certificate.id}
        empty={
          <EmptyState
            title="No certificates yet"
            body="Complete a class to issue its certificates."
          />
        }
        columns={[
          {
            key: "student",
            header: "Student",
            cell: (row) => <span className="font-semibold">{row.studentName}</span>,
          },
          { key: "course", header: "Class", wrap: true, cell: (row) => row.courseTitle },
          {
            key: "code",
            header: "Code",
            cell: (row) => <span className="font-mono">{row.code}</span>,
          },
          {
            key: "issued",
            header: "Issued",
            hideBelow: "xl",
            cell: (row) => formatDate(row.issuedAt),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <Badge tone={row.revokedAt ? "danger" : "success"}>
                {row.revokedAt ? "Revoked" : "Valid"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (row) => (
              <div className="flex items-center justify-end">
                <IconButton
                  label={`Email ${row.studentName}'s certificate again`}
                  disabled={Boolean(row.revokedAt) || pending === `send-${row.id}`}
                  onClick={() =>
                    run(
                      `send-${row.id}`,
                      () => meetingsApi.resendCertificate(row.id),
                      "Certificate emailed again (see Outbox).",
                    )
                  }
                >
                  <Send className="size-4" />
                </IconButton>
                <Button
                  size="sm"
                  variant="ghost"
                  href={`/certificates/${row.code}`}
                  target="_blank"
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant={row.revokedAt ? "ghost" : "danger"}
                  loading={pending === row.id}
                  onClick={() =>
                    run(
                      row.id,
                      () => meetingsApi.setCertificateRevoked(row.id, !row.revokedAt),
                      row.revokedAt ? "Certificate restored." : "Certificate revoked.",
                    )
                  }
                >
                  {row.revokedAt ? "Restore" : "Revoke"}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}

"use client";

import type { ReactElement } from "react";

import { settingsApi } from "@/lib/api";
import { formatDate } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { courseById } from "@/lib/store/selectors";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";

/** Issue certificates to confirmed enrolments once a student completes the course. */
export function CertificatesAdmin(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const confirmed = db.orders.filter((order) => order.status === "confirmed");

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Issue a certificate when a student completes their course. Each has a public verification link."
      />
      <DataTable
        caption="Confirmed enrolments"
        rows={confirmed}
        rowKey={(order) => order.id}
        empty={<EmptyState title="No confirmed enrolments yet" />}
        columns={[
          {
            key: "student",
            header: "Student",
            cell: (order) => <span className="font-medium">{order.contact.name}</span>,
          },
          {
            key: "course",
            header: "Course",
            cell: (order) => courseById(db, order.courseId)?.title ?? "—",
          },
          {
            key: "certificate",
            header: "Certificate",
            className: "text-right",
            cell: (order) => {
              const certificate = db.certificates.find(
                (candidate) => candidate.orderId === order.id,
              );
              if (!certificate) {
                return (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={pending === order.id}
                    onClick={() =>
                      run(
                        order.id,
                        () => settingsApi.issueCertificate(order.id),
                        "Certificate issued.",
                      )
                    }
                  >
                    Issue
                  </Button>
                );
              }
              return (
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <span className="mr-2 font-mono text-label text-ink-soft">
                    {certificate.code} · {formatDate(certificate.issuedAt)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    href={`/certificates/${certificate.code}`}
                    target="_blank"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={pending === certificate.id}
                    onClick={() =>
                      run(
                        certificate.id,
                        () => settingsApi.revokeCertificate(certificate.id),
                        "Certificate revoked.",
                      )
                    }
                  >
                    Revoke
                  </Button>
                </div>
              );
            },
          },
        ]}
      />
    </>
  );
}

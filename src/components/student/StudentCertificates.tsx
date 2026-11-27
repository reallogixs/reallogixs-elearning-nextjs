"use client";

import type { ReactElement } from "react";
import { Award } from "lucide-react";

import { formatDate } from "@/lib/domain/format";
import { ordersForStudent } from "@/lib/portal/selectors";
import { useStudent } from "@/lib/account/useRoleUser";
import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CertificateSeal } from "@/components/certificates/CertificateSeal";

export function StudentCertificates(): ReactElement | null {
  const db = usePortalData();
  const student = useStudent();
  if (!student) return null;
  const orderIds = new Set(ordersForStudent(db, student).map((order) => order.id));
  const certificates = db.certificates.filter(
    (certificate) => orderIds.has(certificate.orderId) && !certificate.revokedAt,
  );

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Emailed to you and added here when a class you attended is completed."
      />
      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="size-5" />}
          title="No certificates yet"
          body="Join a live class and your certificate will appear here once it is completed."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id} padded={false} className="overflow-hidden">
              <div className="on-dark relative isolate flex items-center gap-4 bg-gradient-deep p-5 text-white">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-grid-dark opacity-60"
                />
                <CertificateSeal className="size-14" />
                <p className="font-display text-h4 text-white">{certificate.courseTitle}</p>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <p className="text-small text-ink-soft">
                  Issued {formatDate(certificate.issuedAt)} ·{" "}
                  <span className="font-mono text-ink">{certificate.code}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button href={`/certificates/${certificate.code}`} size="sm">
                    View certificate
                  </Button>
                  <Button
                    href={`/certificates/${certificate.code}/pdf`}
                    prefetch={false}
                    data-file
                    size="sm"
                    variant="secondary"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

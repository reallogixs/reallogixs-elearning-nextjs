"use client";

import type { ReactElement } from "react";
import { Award } from "lucide-react";

import { formatDate } from "@/lib/domain/format";
import { useDb } from "@/lib/store/hooks";
import { ordersForStudent } from "@/lib/store/selectors";
import { useStudent } from "@/lib/store/useRoleUser";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function StudentCertificates(): ReactElement | null {
  const db = useDb();
  const student = useStudent();
  if (!student) return null;
  const orderIds = new Set(ordersForStudent(db, student).map((order) => order.id));
  const certificates = db.certificates.filter((certificate) => orderIds.has(certificate.orderId));

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Issued by Reallogixs when you complete a course."
      />
      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="size-5" />}
          title="No certificates yet"
          body="Finish a course and your certificate will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col gap-3">
              <Award aria-hidden="true" className="size-6 text-teal-600" />
              <p className="font-display text-h4">{certificate.courseTitle}</p>
              <p className="text-small text-ink-soft">
                Issued {formatDate(certificate.issuedAt)} ·{" "}
                <span className="font-mono">{certificate.code}</span>
              </p>
              <Button
                href={`/certificates/${certificate.code}`}
                size="sm"
                variant="secondary"
                className="self-start"
              >
                View &amp; print
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

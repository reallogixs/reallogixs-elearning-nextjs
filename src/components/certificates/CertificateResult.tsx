import type { ReactElement } from "react";
import { BadgeCheck, BadgeX } from "lucide-react";

import type { Certificate } from "@/types/domain";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/domain/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { CertificateSeal } from "./CertificateSeal";

export function CertificateResult({ certificate }: { certificate: Certificate }): ReactElement {
  const valid = !certificate.revokedAt;
  const Icon = valid ? BadgeCheck : BadgeX;
  const rows = [
    ["Issued to", certificate.studentName],
    ["Class", certificate.courseTitle],
    ["Issued on", formatDate(certificate.issuedAt)],
    ["Code", certificate.code],
  ] as const;
  return (
    <Card padded={false} className="overflow-hidden">
      <div
        className={cn(
          "on-dark relative isolate flex items-center gap-4 p-6 text-white sm:p-8",
          valid ? "bg-gradient-deep" : "bg-navy-900",
        )}
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-60" />
        {valid ? (
          <CertificateSeal className="size-16" />
        ) : (
          <Icon aria-hidden="true" className="size-12 shrink-0 text-error" />
        )}
        <div>
          <h2 className="text-h3 text-white">
            {valid ? "Genuine certificate" : "Certificate revoked"}
          </h2>
          <p className="text-small text-on-dark">
            {valid
              ? "Issued by Reallogixs Academy."
              : "Reallogixs issued this certificate, but it is no longer valid."}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <dl className="grid gap-4 text-small sm:grid-cols-2">
          {rows.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-ink-soft">{term}</dt>
              <dd className="font-medium">{detail}</dd>
            </div>
          ))}
        </dl>
        {valid ? (
          <Button
            href={`/certificates/${certificate.code}`}
            variant="secondary"
            size="sm"
            className="self-start"
          >
            View certificate
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

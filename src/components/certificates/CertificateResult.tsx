import type { ReactElement } from "react";
import { BadgeCheck, BadgeX } from "lucide-react";

import type { Certificate } from "@/types/domain";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/domain/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <Card className="flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Icon
          aria-hidden="true"
          className={cn("size-9 shrink-0", valid ? "text-success-text" : "text-error-text")}
        />
        <div>
          <h2 className="text-h4">{valid ? "Genuine certificate" : "Certificate revoked"}</h2>
          <p className="text-small text-ink-soft">
            {valid
              ? "Issued by Reallogixs Academy."
              : "Reallogixs issued this certificate, but it is no longer valid."}
          </p>
        </div>
      </div>
      <dl className="grid gap-4 border-t border-line pt-6 text-small sm:grid-cols-2">
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
    </Card>
  );
}

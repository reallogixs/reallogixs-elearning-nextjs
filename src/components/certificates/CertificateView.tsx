"use client";

import type { ReactElement } from "react";
import { Download, Printer } from "lucide-react";

import type { Certificate } from "@/types/domain";
import { formatDate } from "@/lib/domain/format";
import { Logo } from "@/components/brand/Logo";
import { CircuitLine } from "@/components/brand/CircuitLine";
import { Button } from "@/components/ui/Button";

export function CertificateView({ certificate }: { certificate: Certificate }): ReactElement {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-6 bg-mist p-4 py-10 print:bg-white print:p-0">
      <div data-print-hide className="flex flex-wrap justify-center gap-3">
        <Button
          size="sm"
          icon={<Download className="size-4" />}
          href={`/certificates/${certificate.code}/pdf`}
          prefetch={false}
          data-file
        >
          Download PDF
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Printer className="size-4" />}
          onClick={() => window.print()}
        >
          Print
        </Button>
        <Button size="sm" variant="secondary" href={`/verify?code=${certificate.code}`}>
          Verify
        </Button>
      </div>
      <article className="flex aspect-[1.414] w-full max-w-4xl flex-col justify-between rounded-lg border border-line bg-white p-8 sm:p-14 print:rounded-none print:border-0">
        <div className="flex items-center justify-between">
          <Logo className="h-7 lg:h-9" title="Reallogixs" />
          <p className="font-mono text-label text-ink-soft uppercase">Certificate of completion</p>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <p className="text-ink-soft">This certifies that</p>
          <h1 className="text-h1">{certificate.studentName}</h1>
          <p className="text-ink-soft">attended the live masterclass</p>
          <p className="text-gradient font-display text-h3">{certificate.courseTitle}</p>
        </div>
        <div className="flex flex-col gap-4">
          <CircuitLine className="opacity-60" />
          <div className="flex flex-wrap justify-between gap-4 text-small text-ink-soft">
            <span>Issued {formatDate(certificate.issuedAt)}</span>
            <span className="font-mono">Verify: {certificate.code}</span>
          </div>
        </div>
      </article>
    </div>
  );
}

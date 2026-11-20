"use client";

import type { ReactElement } from "react";
import { Printer } from "lucide-react";

import { formatDate } from "@/lib/domain/format";
import { useDb, useHydrated } from "@/lib/store/hooks";
import { Logo } from "@/components/brand/Logo";
import { CircuitLine } from "@/components/brand/CircuitLine";
import { Button } from "@/components/ui/Button";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { Skeleton } from "@/components/ui/Skeleton";

/** Printable certificate; the URL doubles as the public verification link. */
export function CertificateView({ code }: { code: string }): ReactElement {
  const db = useDb();
  const hydrated = useHydrated();
  const certificate = db.certificates.find((candidate) => candidate.code === code.toUpperCase());

  if (!certificate) {
    if (!hydrated) return <Skeleton className="m-8 h-96" />;
    return (
      <NotFoundState
        title="Certificate not found"
        body="Check the verification code and try again."
        href="/"
        cta="Go home"
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center gap-6 bg-mist p-4 py-10 print:bg-white print:p-0">
      <div data-print-hide className="flex gap-3">
        <Button size="sm" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print or save as PDF
        </Button>
        <Button size="sm" variant="secondary" href="/">
          Academy home
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
          <p className="text-ink-soft">has successfully completed</p>
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

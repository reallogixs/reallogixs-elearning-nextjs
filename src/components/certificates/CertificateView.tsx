"use client";

import type { CSSProperties, ReactElement } from "react";
import { Download, Printer, ShieldCheck } from "lucide-react";

import type { Certificate } from "@/types/domain";
import {
  BAND,
  CIRCUIT,
  baselineOffset,
  certificatePieces,
  PAGE,
  type CertificateInput,
  type CertificatePiece,
} from "@/lib/certificateLayout";
import { formatDate } from "@/lib/domain/format";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

import { CertificateSeal } from "./CertificateSeal";
import { certificateSans, certificateSerif } from "./fonts";

/** Points on the A4 page → a share of the certificate's width, so it scales like the PDF. */
const pt = (value: number): string => `${(value / PAGE.width) * 100}cqw`;

const FAMILY = {
  serif: "var(--font-cert-serif)",
  serifItalic: "var(--font-cert-serif)",
  sans: "var(--font-cert-sans)",
  sansMedium: "var(--font-cert-sans)",
  sansBold: "var(--font-cert-sans)",
} as const;
const WEIGHT = { serif: 600, serifItalic: 600, sans: 400, sansMedium: 500, sansBold: 600 } as const;

function Piece({ piece }: { piece: CertificatePiece }): ReactElement {
  if (piece.kind === "text") {
    const style: CSSProperties = {
      left: pt(piece.x),
      top: pt(piece.baseline - baselineOffset(piece.font, piece.size, 1)),
      fontFamily: FAMILY[piece.font],
      fontWeight: WEIGHT[piece.font],
      fontStyle: piece.font === "serifItalic" ? "italic" : "normal",
      fontSize: pt(piece.size),
      lineHeight: 1,
      letterSpacing: piece.tracking ? pt(piece.tracking) : undefined,
      color: piece.colour,
    };
    return (
      <span className="absolute whitespace-nowrap" style={style}>
        {piece.text}
      </span>
    );
  }
  if (piece.kind === "rule")
    return (
      <span
        aria-hidden="true"
        className="absolute rounded-pill"
        style={{
          left: pt(piece.x),
          top: pt(piece.top),
          width: pt(piece.width),
          height: pt(Math.max(piece.height, 1)),
          background: piece.colour,
          opacity: piece.height < 1 ? 0.9 : 1,
        }}
      />
    );
  if (piece.kind === "logo")
    return (
      <span
        className="absolute [--logo-gixs:#fff] [--logo-o:#fff] [--logo-real:#fff]"
        style={{ left: pt(piece.x), top: pt(piece.top), width: pt(piece.width) }}
      >
        <Logo className="h-auto w-full lg:h-auto" title="Reallogixs" />
      </span>
    );
  if (piece.kind === "seal")
    return (
      <span
        className="absolute"
        style={{
          left: pt(piece.x),
          top: pt(piece.top),
          width: pt(piece.size),
          height: pt(piece.size),
        }}
      >
        <CertificateSeal className="size-full" />
      </span>
    );
  const path = piece.points.map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}
      className="pointer-events-none absolute inset-0 size-full"
    >
      <path d={path} fill="none" stroke={piece.colour} strokeWidth="1" />
      <circle
        cx={piece.node[0]}
        cy={piece.node[1]}
        r={CIRCUIT.node}
        fill="none"
        stroke={piece.colour}
        strokeWidth="1"
      />
    </svg>
  );
}

interface CertificateViewProps {
  certificate: Certificate;
  /** Name and title line breaks, measured on the server with the PDF's fonts. */
  text: Pick<CertificateInput, "name" | "course">;
}

/** The certificate exactly as the PDF draws it, scaled to the screen. */
export function CertificateView({ certificate, text }: CertificateViewProps): ReactElement {
  const pieces = certificatePieces({
    ...text,
    issued: formatDate(certificate.issuedAt),
    code: certificate.code,
  });
  const name = text.name.lines.join(" ");
  return (
    <div
      className={`certificate-page ${certificateSerif.variable} ${certificateSans.variable} flex min-h-dvh flex-col items-center gap-6 bg-mesh px-4 py-10 print:block print:bg-white print:p-0`}
    >
      <div data-print-hide className="flex flex-wrap justify-center gap-3">
        <Button
          size="sm"
          tone="dark"
          icon={<Download className="size-4" />}
          href={`/certificates/${certificate.code}/pdf`}
          prefetch={false}
          data-file
        >
          Download PDF
        </Button>
        <Button
          size="sm"
          tone="dark"
          variant="secondary"
          icon={<Printer className="size-4" />}
          onClick={() => window.print()}
        >
          Print
        </Button>
        <Button
          size="sm"
          tone="dark"
          variant="ghost"
          icon={<ShieldCheck className="size-4" />}
          href={`/verify?code=${certificate.code}`}
        >
          Verify
        </Button>
      </div>

      {/* Phones scroll sideways inside this box only; the certificate keeps its proportions. */}
      <div className="w-full max-w-5xl overflow-x-auto pb-2 print:max-w-none print:overflow-visible print:pb-0">
        <article
          aria-label={`Certificate of completion for ${name}: ${certificate.courseTitle}`}
          className="[container-type:inline-size] relative mx-auto aspect-[842/595] w-full min-w-[640px] overflow-hidden rounded-lg bg-white shadow-card print:min-w-0 print:rounded-none print:shadow-none"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0"
            style={{
              width: pt(BAND.width),
              backgroundColor: "#0B1428",
              backgroundImage: `linear-gradient(to right, rgb(31 46 85 / 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgb(31 46 85 / 0.7) 1px, transparent 1px), linear-gradient(to bottom, #0B1428 0%, #16244A 55%, #1C4E6E 100%)`,
              backgroundSize: `${pt(32)} ${pt(32)}, ${pt(32)} ${pt(32)}, 100% 100%`,
              backgroundPosition: `${pt(-1)} ${pt(-1)}, ${pt(-1)} ${pt(-1)}, 0 0`,
            }}
          />
          {pieces.map((piece, index) => (
            <Piece key={index} piece={piece} />
          ))}
        </article>
      </div>
    </div>
  );
}

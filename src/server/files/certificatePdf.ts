import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

import {
  BAND,
  certificatePieces,
  INK,
  PAGE,
  type CertificateFont,
  type CertificatePiece,
} from "@/lib/certificateLayout";
import { formatDate } from "@/lib/domain/format";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/brand/logoPath";
import { CHECK_BADGE, CHECK_TICK } from "@/components/certificates/CertificateSeal";

import { fontBytes, layoutCertificateText } from "./certificateFonts";

/** What is printed on a certificate. */
export interface PrintedCertificate {
  code: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}

const hex = (value: string): RGB => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((at) => parseInt(value.slice(at, at + 2), 16) / 255);
  return rgb(r, g, b);
};
const WHITE = rgb(1, 1, 1);

/** PDF measures from the bottom; the layout from the top. */
const up = (top: number): number => PAGE.height - top;

function mix(from: string, to: string, amount: number): RGB {
  const [a, b] = [from, to].map((value) =>
    [1, 3, 5].map((at) => parseInt(value.slice(at, at + 2), 16) / 255),
  );
  const part = (index: number): number =>
    (a?.[index] ?? 0) + ((b?.[index] ?? 0) - (a?.[index] ?? 0)) * amount;
  return rgb(part(0), part(1), part(2));
}

/** Navy fading to teal at the bottom with a faint grid: the web page's band. */
function drawBand(page: PDFPage): void {
  const steps = 80;
  for (let index = 0; index < steps; index += 1) {
    const share = index / (steps - 1);
    const colour =
      share < 0.55
        ? mix(INK.navy, INK.navySoft, share / 0.55)
        : mix(INK.navySoft, INK.bandEnd, (share - 0.55) / 0.45);
    const height = PAGE.height / steps;
    page.drawRectangle({
      x: 0,
      y: up((index + 1) * height),
      width: BAND.width,
      height: height + 0.4,
      color: colour,
    });
  }
  const grid = { thickness: 0.4, color: hex(INK.grid), opacity: 0.7 };
  for (let x = 32; x < BAND.width; x += 32)
    page.drawLine({ start: { x, y: 0 }, end: { x, y: PAGE.height }, ...grid });
  // Counted from the top, as on the web page.
  for (let top = 32; top < PAGE.height; top += 32)
    page.drawLine({ start: { x: 0, y: up(top) }, end: { x: BAND.width, y: up(top) }, ...grid });
}

function drawText(
  page: PDFPage,
  fonts: Record<CertificateFont, PDFFont>,
  piece: Extract<CertificatePiece, { kind: "text" }>,
): void {
  const font = fonts[piece.font];
  const letters = [...piece.text];
  const natural = font.widthOfTextAtSize(piece.text, piece.size);
  const tracking = piece.width
    ? (piece.width - natural) / Math.max(1, letters.length - 1)
    : (piece.tracking ?? 0);
  const options = { y: up(piece.baseline), size: piece.size, font, color: hex(piece.colour) };
  if (!tracking) {
    page.drawText(piece.text, { ...options, x: piece.x });
    return;
  }
  let x = piece.x;
  for (const letter of letters) {
    page.drawText(letter, { ...options, x });
    x += font.widthOfTextAtSize(letter, piece.size) + tracking;
  }
}

/** The same 100-unit drawing as the web seal. */
function drawSeal(
  page: PDFPage,
  fonts: Record<CertificateFont, PDFFont>,
  x: number,
  top: number,
  size: number,
): void {
  const s = size / 100;
  const centre = { x: x + 50 * s, y: up(top + 50 * s) };
  page.drawCircle({ ...centre, size: 50 * s, color: hex(INK.skyLight) });
  page.drawCircle({ ...centre, size: 45 * s, color: hex(INK.navy) });
  page.drawCircle({
    ...centre,
    size: 39 * s,
    borderColor: WHITE,
    borderOpacity: 0.45,
    borderWidth: s,
    borderDashArray: [3 * s, 3 * s],
  });
  const icon = 1.08 * s;
  for (const path of [CHECK_BADGE, CHECK_TICK])
    page.drawSvgPath(path, {
      x: x + 37 * s,
      y: up(top + 25 * s),
      scale: icon,
      borderColor: hex("#5FD3F5"),
      borderWidth: 1.8 * icon,
    });
  drawText(page, fonts, {
    kind: "text",
    text: "VERIFIED",
    font: "sansBold",
    size: 9 * s,
    colour: "#FFFFFF",
    x: x + 27 * s,
    baseline: top + 69 * s,
    width: 46 * s,
  });
}

/**
 * The certificate as a PDF, from the same pieces and fonts as the web page. Null if the name or
 * title uses letters the fonts don't have (e.g. Urdu script): the web page shows those.
 */
export async function certificatePdf(certificate: PrintedCertificate): Promise<Uint8Array | null> {
  const text = await layoutCertificateText(certificate.studentName, certificate.courseTitle);
  if (!text.printable) return null;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const bytes = await fontBytes();
  const entries = await Promise.all(
    (Object.keys(bytes) as CertificateFont[]).map(
      async (name) => [name, await pdf.embedFont(bytes[name], { subset: true })] as const,
    ),
  );
  const fonts = Object.fromEntries(entries) as Record<CertificateFont, PDFFont>;
  pdf.setTitle(`Certificate ${certificate.code}`);
  pdf.setAuthor("Reallogixs Academy");
  const page = pdf.addPage([PAGE.width, PAGE.height]);
  drawBand(page);

  const pieces = certificatePieces({
    ...text,
    issued: formatDate(certificate.issuedAt),
    code: certificate.code,
  });
  const logoWidth = Number(LOGO_VIEWBOX.split(/\s+/)[2]);
  for (const piece of pieces) {
    if (piece.kind === "text") drawText(page, fonts, piece);
    else if (piece.kind === "rule")
      page.drawRectangle({
        x: piece.x,
        y: up(piece.top + piece.height),
        width: piece.width,
        height: piece.height,
        color: hex(piece.colour),
      });
    else if (piece.kind === "logo")
      page.drawSvgPath(LOGO_PATH, {
        x: piece.x,
        y: up(piece.top),
        scale: piece.width / logoWidth,
        color: WHITE,
      });
    else if (piece.kind === "seal") drawSeal(page, fonts, piece.x, piece.top, piece.size);
    else {
      piece.points.slice(1).forEach(([x2, y2], index) => {
        const [x1, y1] = piece.points[index] ?? [x2, y2];
        page.drawLine({
          start: { x: x1, y: up(y1) },
          end: { x: x2, y: up(y2) },
          thickness: 1,
          color: hex(piece.colour),
        });
      });
      page.drawCircle({
        x: piece.node[0],
        y: up(piece.node[1]),
        size: 5,
        borderColor: hex(piece.colour),
        borderWidth: 1,
      });
    }
  }
  return pdf.save();
}

import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

import { formatDate } from "@/lib/domain/format";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/brand/logoPath";

/** What is printed on a certificate. */
export interface PrintedCertificate {
  code: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}

/** A4 landscape, in points. */
const PAGE = { width: 841.89, height: 595.28 };
const MARGIN = 64;
const WIDTH = PAGE.width - MARGIN * 2;
const LOGO_WIDTH = 150;

/** Brand tokens (tokens.css): PDFs can't read CSS variables. */
const COLOUR = {
  ink: rgb(0.055, 0.09, 0.149),
  soft: rgb(0.29, 0.337, 0.408),
  teal: rgb(0.106, 0.416, 0.522),
  sky: rgb(0.239, 0.576, 0.761),
  line: rgb(0.863, 0.89, 0.918),
};

function fits(font: PDFFont, text: string, size: number): boolean {
  return font.widthOfTextAtSize(text, size) <= WIDTH;
}

/** Splits into lines that fit the page. */
function wrap(font: PDFFont, text: string, size: number): string[] {
  return text.split(/\s+/).reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && fits(font, `${last} ${word}`, size))
      return [...lines.slice(0, -1), `${last} ${word}`];
    return [...lines, word];
  }, []);
}

/** Draws centred lines, shrinking the text until it needs at most two. Returns the next y. */
function centred(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  size: number,
  color: RGB,
): number {
  let used = size;
  let lines = wrap(font, text, used);
  while (used > 12 && (lines.length > 2 || lines.some((line) => !fits(font, line, used)))) {
    used -= 1;
    lines = wrap(font, text, used);
  }
  return lines.reduce((at, line) => {
    const x = (PAGE.width - font.widthOfTextAtSize(line, used)) / 2;
    page.drawText(line, { x, y: at, size: used, font, color });
    return at - used * 1.25;
  }, y);
}

/**
 * The certificate as a PDF. Null if the name or title uses letters the built-in fonts don't have
 * (e.g. Urdu script): the web page still shows those correctly.
 */
export async function certificatePdf(certificate: PrintedCertificate): Promise<Uint8Array | null> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const name = certificate.studentName.normalize("NFC");
  const title = certificate.courseTitle.normalize("NFC");
  const letters = new Set(bold.getCharacterSet());
  if ([...`${name}${title}`].some((letter) => !letters.has(letter.codePointAt(0) ?? 0)))
    return null;

  pdf.setTitle(`Certificate ${certificate.code}`);
  pdf.setAuthor("Reallogixs Academy");
  const page = pdf.addPage([PAGE.width, PAGE.height]);
  page.drawRectangle({
    x: 24,
    y: 24,
    width: PAGE.width - 48,
    height: PAGE.height - 48,
    borderColor: COLOUR.line,
    borderWidth: 1,
  });

  const logoWidth = Number(LOGO_VIEWBOX.split(/\s+/)[2]);
  const top = PAGE.height - MARGIN;
  page.drawSvgPath(LOGO_PATH, {
    x: MARGIN,
    y: top,
    scale: LOGO_WIDTH / logoWidth,
    color: COLOUR.teal,
  });
  const label = "CERTIFICATE OF COMPLETION";
  page.drawText(label, {
    x: PAGE.width - MARGIN - mono.widthOfTextAtSize(label, 10),
    y: top - 18,
    size: 10,
    font: mono,
    color: COLOUR.soft,
  });

  let y = 372;
  y = centred(page, regular, "This certifies that", y, 14, COLOUR.soft) - 28;
  y = centred(page, bold, name, y, 40, COLOUR.ink);
  y = centred(page, regular, "attended the live masterclass", y + 4, 14, COLOUR.soft) - 14;
  centred(page, bold, title, y, 24, COLOUR.teal);

  // The circuit line ending in a ring node.
  const base = 118;
  const points: [number, number][] = [
    [MARGIN, base],
    [MARGIN + 260, base],
    [MARGIN + 290, base + 18],
    [PAGE.width - MARGIN - 14, base + 18],
  ];
  points.slice(1).forEach(([x2, y2], index) => {
    const [x1, y1] = points[index] ?? [x2, y2];
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color: COLOUR.sky,
    });
  });
  page.drawCircle({
    x: PAGE.width - MARGIN - 7,
    y: base + 18,
    size: 7,
    borderColor: COLOUR.sky,
    borderWidth: 1,
  });

  const foot = { y: 84, size: 11, color: COLOUR.soft };
  page.drawText(`Issued ${formatDate(certificate.issuedAt)}`, {
    ...foot,
    x: MARGIN,
    font: regular,
  });
  const code = `Verify: ${certificate.code}`;
  page.drawText(code, {
    ...foot,
    x: PAGE.width - MARGIN - mono.widthOfTextAtSize(code, foot.size),
    font: mono,
  });
  return pdf.save();
}

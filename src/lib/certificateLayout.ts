/*
 * One certificate design, measured in PDF points on an A4 landscape page. The web page scales
 * these numbers to its width and the PDF draws them as they are, so both look the same.
 */
export const PAGE = { width: 842, height: 595 };

/** The dark band on the left. */
export const BAND = { width: 288, padding: 40 };

/** The content on the right. */
export const CONTENT = { x: BAND.width + 52, right: 56, top: 64, bottom: 56 };
export const CONTENT_WIDTH = PAGE.width - CONTENT.x - CONTENT.right;

export const SEAL_SIZE = 84;

/** Font sizes and line heights (×size). */
export const TYPE = {
  kicker: { size: 8.5, tracking: 2.2 },
  bandTitle: { size: 36, line: 1.02 },
  lead: { size: 9, tracking: 1.6 },
  name: { size: 44, line: 1.05, min: 26 },
  text: { size: 12 },
  course: { size: 21, line: 1.2, min: 14 },
  footValue: { size: 14 },
  footCode: { size: 11.5, tracking: 0.6 },
  footLabel: { size: 8.5 },
};

/** Vertical gaps between the blocks on the right. */
export const GAP = { lead: 14, rule: 16, text: 14, course: 8 };

/** The circuit line above the footer, ending in a ring node. Relative to CONTENT.x. */
export const CIRCUIT = { y: 150, step: 170, rise: 14, node: 5 };
export const FOOTER = { valueY: 92, ruleY: 82, labelY: 68 };

/** Brand colours (tokens.css). */
export const INK = {
  navy: "#0B1428",
  navySoft: "#16244A",
  bandEnd: "#1C4E6E",
  teal: "#1B6A85",
  sky: "#3D93C2",
  skyLight: "#6FB6DB",
  soft: "#4A5668",
  line: "#DCE3EA",
  grid: "#1F2E55",
};

/** Two lines at most: the font shrinks until it fits. */
export function fitLines(
  text: string,
  measure: (text: string, size: number) => number,
  { size, min }: { size: number; min: number },
  width: number,
): { size: number; lines: string[] } {
  for (let current = size; current >= min; current -= 1) {
    const lines = wrap(text, measure, current, width);
    if (lines.length <= 2 && lines.every((line) => measure(line, current) <= width))
      return { size: current, lines };
  }
  return { size: min, lines: wrap(text, measure, min, width) };
}

function wrap(
  text: string,
  measure: (text: string, size: number) => number,
  size: number,
  width: number,
): string[] {
  return text.split(/\s+/).reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && measure(`${last} ${word}`, size) <= width)
      return [...lines.slice(0, -1), `${last} ${word}`];
    return [...lines, word];
  }, []);
}

/* Everything on the certificate as positioned pieces, drawn the same way by the page and PDF. */

export type CertificateFont = "serif" | "serifItalic" | "sans" | "sansMedium" | "sansBold";

/** Ascent and descent per em, from the font files (what browsers use to place text). */
const METRICS: Record<CertificateFont, { ascent: number; descent: number }> = {
  serif: { ascent: 0.924, descent: 0.287 },
  serifItalic: { ascent: 0.924, descent: 0.287 },
  sans: { ascent: 1.05, descent: 0.35 },
  sansMedium: { ascent: 1.05, descent: 0.35 },
  sansBold: { ascent: 1.05, descent: 0.35 },
};

/** Where the baseline sits below the top of a line box `lineHeight` × size tall. */
export function baselineOffset(font: CertificateFont, size: number, lineHeight: number): number {
  const { ascent, descent } = METRICS[font];
  return ((lineHeight - (ascent + descent)) / 2 + ascent) * size;
}

export type CertificatePiece =
  | {
      kind: "text";
      text: string;
      font: CertificateFont;
      size: number;
      colour: string;
      x: number;
      /** Baseline, from the top of the page. */
      baseline: number;
      tracking?: number;
      /** Fits the word to this width (the seal). */
      width?: number;
    }
  | { kind: "rule"; x: number; top: number; width: number; height: number; colour: string }
  | { kind: "circuit"; points: [number, number][]; node: [number, number]; colour: string }
  | { kind: "seal"; x: number; top: number; size: number }
  | { kind: "logo"; x: number; top: number; width: number };

export interface CertificateInput {
  name: { size: number; lines: string[] };
  course: { size: number; lines: string[] };
  issued: string;
  code: string;
}

export function certificatePieces(input: CertificateInput): CertificatePiece[] {
  const pieces: CertificatePiece[] = [];
  const text = (
    value: string,
    font: CertificateFont,
    size: number,
    colour: string,
    x: number,
    baseline: number,
    extra: { tracking?: number; width?: number } = {},
  ): void => {
    pieces.push({ kind: "text", text: value, font, size, colour, x, baseline, ...extra });
  };

  // Band
  const bx = BAND.padding;
  pieces.push({ kind: "logo", x: bx, top: BAND.padding, width: 150 });
  text("REALLOGIXS ACADEMY", "sansMedium", TYPE.kicker.size, INK.skyLight, bx, 258, {
    tracking: TYPE.kicker.tracking,
  });
  ["Certificate of", "completion"].forEach((line, index) =>
    text(
      line,
      "serif",
      TYPE.bandTitle.size,
      "#FFFFFF",
      bx,
      296 + index * TYPE.bandTitle.size * TYPE.bandTitle.line,
    ),
  );
  pieces.push({
    kind: "seal",
    x: bx,
    top: PAGE.height - BAND.padding - SEAL_SIZE,
    size: SEAL_SIZE,
  });

  // Content
  const x = CONTENT.x;
  let top = CONTENT.top;
  text(
    "THIS CERTIFIES THAT",
    "sansMedium",
    TYPE.lead.size,
    INK.soft,
    x,
    top + baselineOffset("sansMedium", TYPE.lead.size, 1),
    {
      tracking: TYPE.lead.tracking,
    },
  );
  top += TYPE.lead.size + GAP.lead;
  for (const line of input.name.lines) {
    text(
      line,
      "serif",
      input.name.size,
      INK.teal,
      x,
      top + baselineOffset("serif", input.name.size, TYPE.name.line),
    );
    top += input.name.size * TYPE.name.line;
  }
  top += GAP.rule;
  pieces.push({ kind: "rule", x, top, width: 56, height: 3, colour: INK.sky });
  top += 3 + GAP.text;
  text(
    "attended and completed the live masterclass",
    "sans",
    TYPE.text.size,
    INK.soft,
    x,
    top + baselineOffset("sans", TYPE.text.size, 1.5),
  );
  top += TYPE.text.size * 1.5 + GAP.course;
  for (const line of input.course.lines) {
    text(
      line,
      "sansBold",
      input.course.size,
      INK.navy,
      x,
      top + baselineOffset("sansBold", input.course.size, TYPE.course.line),
    );
    top += input.course.size * TYPE.course.line;
  }

  // Circuit line and signature row (fixed to the bottom of the page)
  const base = PAGE.height - CIRCUIT.y;
  const end = x + CONTENT_WIDTH - CIRCUIT.node;
  pieces.push({
    kind: "circuit",
    points: [
      [x, base],
      [x + CIRCUIT.step, base],
      [x + CIRCUIT.step + CIRCUIT.rise * 1.4, base - CIRCUIT.rise],
      [end - CIRCUIT.node, base - CIRCUIT.rise],
    ],
    node: [end, base - CIRCUIT.rise],
    colour: INK.skyLight,
  });
  const column = CONTENT_WIDTH / 3;
  const footer: [string, string, CertificateFont, number, number][] = [
    ["Reallogixs Academy", "Issued by", "serifItalic", TYPE.footValue.size, 0],
    [input.issued, "Date", "serif", TYPE.footValue.size, 0],
    [
      input.code,
      "Verify at learn.reallogixs.com.au",
      "sansMedium",
      TYPE.footCode.size,
      TYPE.footCode.tracking,
    ],
  ];
  footer.forEach(([value, label, font, size, tracking], index) => {
    const left = x + column * index;
    text(value, font, size, INK.navy, left, PAGE.height - FOOTER.valueY, { tracking });
    pieces.push({
      kind: "rule",
      x: left,
      top: PAGE.height - FOOTER.ruleY,
      width: column - 18,
      height: 0.6,
      colour: INK.line,
    });
    text(label, "sans", TYPE.footLabel.size, INK.soft, left, PAGE.height - FOOTER.labelY);
  });
  return pieces;
}

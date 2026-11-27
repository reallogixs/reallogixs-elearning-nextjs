import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import fontkit, { type Font } from "@pdf-lib/fontkit";

import { CONTENT_WIDTH, fitLines, TYPE } from "@/lib/certificateLayout";

/* The certificate's fonts, shared by the web page (for line breaks) and the PDF. */
export const FONT_FILES = {
  serif: "CormorantGaramond-SemiBold.ttf",
  serifItalic: "CormorantGaramond-SemiBoldItalic.ttf",
  sans: "Poppins-Regular.ttf",
  sansMedium: "Poppins-Medium.ttf",
  sansBold: "Poppins-SemiBold.ttf",
} as const;
export type FontName = keyof typeof FONT_FILES;

let files: Promise<Record<FontName, Uint8Array>> | undefined;

/** Read once per server instance. */
export function fontBytes(): Promise<Record<FontName, Uint8Array>> {
  files ??= (async () => {
    const entries = await Promise.all(
      Object.entries(FONT_FILES).map(async ([name, file]) => [
        name,
        new Uint8Array(await readFile(join(process.cwd(), "src/assets/fonts", file))),
      ]),
    );
    return Object.fromEntries(entries) as Record<FontName, Uint8Array>;
  })();
  return files;
}

export interface CertificateText {
  name: { size: number; lines: string[] };
  course: { size: number; lines: string[] };
  /** False if a letter isn't in the fonts (e.g. Urdu script): then there is no PDF. */
  printable: boolean;
}

/** Where the name and course title break, measured with the real fonts. */
export const layoutCertificateText = cache(
  async (studentName: string, courseTitle: string): Promise<CertificateText> => {
    const bytes = await fontBytes();
    const serif = fontkit.create(bytes.serif);
    const sans = fontkit.create(bytes.sansBold);
    const measure =
      (font: Font) =>
      (text: string, size: number): number =>
        (font.layout(text).advanceWidth / font.unitsPerEm) * size;
    const name = studentName.normalize("NFC").trim();
    const course = courseTitle.normalize("NFC").trim();
    const covered = (font: Font, text: string): boolean =>
      [...text.replace(/\s/g, "")].every((letter) =>
        font.hasGlyphForCodePoint(letter.codePointAt(0) ?? 0),
      );
    return {
      name: fitLines(name, measure(serif), TYPE.name, CONTENT_WIDTH),
      course: fitLines(course, measure(sans), TYPE.course, CONTENT_WIDTH),
      printable: covered(serif, name) && covered(sans, course),
    };
  },
);

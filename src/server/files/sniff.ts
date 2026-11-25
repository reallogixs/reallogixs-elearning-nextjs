const SIGNATURES: { type: string; test: (head: Uint8Array) => boolean }[] = [
  { type: "image/jpeg", test: (head) => starts(head, [0xff, 0xd8, 0xff]) },
  { type: "image/png", test: (head) => starts(head, [0x89, 0x50, 0x4e, 0x47]) },
  {
    type: "image/webp",
    test: (head) => ascii(head, 0, 4) === "RIFF" && ascii(head, 8, 12) === "WEBP",
  },
  { type: "application/pdf", test: (head) => ascii(head, 0, 5) === "%PDF-" },
  { type: "image/svg+xml", test: (head) => /^﻿?\s*(<\?xml|<!--|<svg)/.test(ascii(head, 0, 64)) },
];

function starts(head: Uint8Array, bytes: number[]): boolean {
  return bytes.every((byte, index) => head[index] === byte);
}

function ascii(head: Uint8Array, from: number, to: number): string {
  return new TextDecoder().decode(head.slice(from, to));
}

/** The real type from the file's first bytes; the browser's claim isn't trusted. */
export function sniffType(bytes: ArrayBuffer): string | null {
  const head = new Uint8Array(bytes.slice(0, 64));
  return SIGNATURES.find((signature) => signature.test(head))?.type ?? null;
}

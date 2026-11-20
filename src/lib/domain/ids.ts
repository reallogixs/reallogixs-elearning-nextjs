const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/** Internal record id. */
export function newId(prefix: string): string {
  return `${prefix}_${randomChars(10).toLowerCase()}`;
}

/** Public order number shown to students, e.g. RLX-4F7K2. */
export function newOrderNumber(): string {
  return `RLX-${randomChars(5)}`;
}

/** Referral code built from a teacher's first name, e.g. SANA-7K2. */
export function newPromoCode(name: string): string {
  const stem = (name.split(/\s+/)[0] ?? "TEACH")
    .replace(/[^a-z]/gi, "")
    .slice(0, 6)
    .toUpperCase();
  return `${stem || "TEACH"}-${randomChars(3)}`;
}

/** Temporary password emailed to new teachers. */
export function newTempPassword(): string {
  return `Rlx-${randomChars(4)}-${randomChars(4)}`;
}

export function newCertificateCode(): string {
  return `CERT-${randomChars(6)}`;
}

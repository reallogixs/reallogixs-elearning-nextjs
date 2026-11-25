import { createHash, randomBytes } from "node:crypto";

/** A random secret for cookies and emailed links. Only its hash goes in the database. */
export function newSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

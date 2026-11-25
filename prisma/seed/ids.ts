import { createHash } from "node:crypto";

/** The same demo id always gives the same UUID, so seeding twice doesn't duplicate rows. */
export function uuid(id: string): string {
  const hex = createHash("sha256").update(`rlx-academy:${id}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

import { scrypt, timingSafeEqual } from "node:crypto";
import { compare, hash } from "bcrypt";

const ROUNDS = 12;

/** The same letters typed on different keyboards must give the same bytes. */
function prepare(password: string): string {
  return password.normalize("NFKC");
}

export function hashPassword(password: string): Promise<string> {
  return hash(prepare(password), ROUNDS);
}

let decoy: Promise<string> | undefined;

/** With no stored hash it still does the work, so timing doesn't reveal which emails exist. */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (stored?.startsWith("scrypt$")) return verifyScrypt(password, stored);
  if (stored) return compare(prepare(password), stored);
  decoy ??= hash("no such account", ROUNDS);
  await compare(prepare(password), await decoy);
  return false;
}

/** Passwords saved before bcrypt. Login replaces them, so nobody has to choose a new one. */
export function isOldHash(stored: string): boolean {
  return stored.startsWith("scrypt$");
}

function verifyScrypt(password: string, stored: string): Promise<boolean> {
  const [, n, r, p, salt = "", key = ""] = stored.split("$");
  const cost = { N: Number(n), r: Number(r), p: Number(p) };
  const expected = Buffer.from(key, "base64");
  return new Promise((resolve, reject) => {
    scrypt(
      prepare(password),
      Buffer.from(salt, "base64"),
      expected.length,
      { ...cost, maxmem: 256 * cost.N * cost.r },
      (error, actual) => (error ? reject(error) : resolve(timingSafeEqual(actual, expected))),
    );
  });
}

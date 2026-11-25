import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// OWASP's scrypt settings (N=2^17, r=8, p=1). Stored with the hash so they can be raised later.
const COST = { N: 131_072, r: 8, p: 1 };
const KEY_LENGTH = 32;

function derive(
  password: string,
  salt: Buffer,
  cost: typeof COST,
  length: number,
): Promise<Buffer> {
  const options: ScryptOptions = { ...cost, maxmem: 256 * cost.N * cost.r };
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, length, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST, KEY_LENGTH);
  return ["scrypt", COST.N, COST.r, COST.p, salt.toString("base64"), key.toString("base64")].join(
    "$",
  );
}

/** With no stored hash it still does the work, so timing doesn't reveal which emails exist. */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const [scheme, n, r, p, salt, key] = (stored ?? "").split("$");
  if (scheme !== "scrypt" || !salt || !key) {
    await derive(password, randomBytes(16), COST, KEY_LENGTH);
    return false;
  }
  const expected = Buffer.from(key, "base64");
  const cost = { N: Number(n), r: Number(r), p: Number(p) };
  const actual = await derive(password, Buffer.from(salt, "base64"), cost, expected.length);
  return timingSafeEqual(actual, expected);
}

import "server-only";

import { createDb } from "./client";
import type { PrismaClient } from "./generated/client";

const store = globalThis as typeof globalThis & { academyDb?: PrismaClient };

/** The shared client, made on first use so builds don't need a database. */
export function db(): PrismaClient {
  if (store.academyDb) return store.academyDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  const client = createDb(url);
  store.academyDb = client;
  return client;
}

/** The client inside a transaction; helpers that may run in one take this type. */
export type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

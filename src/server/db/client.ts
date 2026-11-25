import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client";

/** Small pool: on Vercel each instance has its own, and Supabase's pooler shares them out. */
const POOL_SIZE = 5;

export function createDb(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, max: POOL_SIZE, connectionTimeoutMillis: 10_000 }),
  });
}

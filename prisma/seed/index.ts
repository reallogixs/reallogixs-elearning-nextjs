import { createDb } from "../../src/server/db/client";

import { seedBaseline } from "./baseline";
import { seedDemo } from "./demo";

/**
 * `pnpm db:seed`       site text, categories, payment methods (safe for production)
 * `pnpm db:seed:demo`  the same plus demo people and orders (development only)
 */
async function main(): Promise<void> {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL is not set.");
  const demo = process.env.SEED_DEMO === "1";
  if (demo && process.env.NODE_ENV === "production")
    throw new Error("Demo data is for development only.");
  const db = createDb(url);
  try {
    await seedBaseline(db);
    if (demo) await seedDemo(db);
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

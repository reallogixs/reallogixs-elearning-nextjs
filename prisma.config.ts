import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 doesn't read env files itself. Real environment variables win over the file.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed/index.ts" },
  // Migrations need a session connection (port 5432), not the transaction pooler.
  // Empty is fine for `prisma generate`, which doesn't connect.
  datasource: { url: process.env.DIRECT_URL ?? "" },
});

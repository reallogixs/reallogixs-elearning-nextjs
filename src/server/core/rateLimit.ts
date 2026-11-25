import { hashSecret } from "./tokens";

import type { Tx } from "@/server/db";

interface Limit {
  max: number;
  windowSeconds: number;
}

/**
 * Counts an attempt and says whether it is still allowed. One atomic statement, so parallel
 * attempts can't slip past. The caller (email, IP…) is stored only as a hash.
 */
export async function allowAttempt(
  client: Pick<Tx, "$queryRaw">,
  action: string,
  caller: string,
  { max, windowSeconds }: Limit,
): Promise<boolean> {
  const key = `${action}:${hashSecret(caller)}`;
  const rows = await client.$queryRaw<{ count: number }[]>`
    INSERT INTO rate_limits (key, count, window_ends_at)
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}::int))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_ends_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
      window_ends_at = CASE WHEN rate_limits.window_ends_at <= now()
        THEN excluded.window_ends_at ELSE rate_limits.window_ends_at END
    RETURNING count`;
  return (rows[0]?.count ?? max + 1) <= max;
}

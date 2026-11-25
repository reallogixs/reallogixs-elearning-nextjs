import type { Tx } from "@/server/db";

/** Records an admin change. Details hold what changed, never personal data. */
export async function audit(
  client: Tx,
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, string | number | boolean>,
): Promise<void> {
  await client.auditEntry.create({ data: { actorId, action, entity, entityId, details } });
}

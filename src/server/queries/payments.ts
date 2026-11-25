import "server-only";

import type { PaymentMethod } from "@/types/domain";
import { db } from "@/server/db";
import { logoUrl } from "@/server/files/storage";

/** In checkout order. Students only ever get the enabled ones. */
export async function listPaymentMethods(filter: {
  enabledOnly: boolean;
}): Promise<PaymentMethod[]> {
  const methods = await db().paymentMethod.findMany({
    where: { archivedAt: null, ...(filter.enabledOnly ? { enabled: true } : {}) },
    include: { fields: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  });
  return methods.map((method) => ({
    id: method.id,
    name: method.name,
    logoUrl: logoUrl(method.logoPublicId),
    fields: method.fields.map(({ id, label, value, copyable }) => ({ id, label, value, copyable })),
    instructions: method.instructions,
    enabled: method.enabled,
    order: method.position,
  }));
}

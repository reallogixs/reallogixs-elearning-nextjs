"use server";

import {
  idSchema,
  moveSchema,
  savePaymentMethodSchema,
  setMethodEnabledSchema,
} from "@/lib/validation/admin";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { ActionError } from "@/server/core/errors";
import { db, type Tx } from "@/server/db";
import { removeFile, saveImage } from "@/server/files/storage";

async function findMethod(client: Tx, id: string) {
  const method = await client.paymentMethod.findFirst({ where: { id, archivedAt: null } });
  if (!method) throw new ActionError("Payment method not found.");
  return method;
}

/** A new logo arrives as a data URL; anything else means "keep", and null means "remove". */
export const savePaymentMethod = roleAction(
  "save-payment-method",
  "admin",
  savePaymentMethodSchema,
  async ({ id, logoUrl, fields, ...values }, admin): Promise<void> => {
    const before = id ? await findMethod(db(), id) : null;
    const uploaded = logoUrl?.startsWith("data:") ? await saveImage("logos", logoUrl) : null;
    const logoPublicId = uploaded ?? (logoUrl ? (before?.logoPublicId ?? null) : null);
    const rows = fields.map(({ label, value, copyable }, position) => ({
      label,
      value,
      copyable,
      position,
    }));
    try {
      await db().$transaction(async (tx) => {
        if (before) {
          await tx.paymentField.deleteMany({ where: { paymentMethodId: id } });
          await tx.paymentMethod.update({
            where: { id },
            data: { ...values, logoPublicId, fields: { create: rows } },
          });
          await audit(tx, admin.id, "payment_method.update", "payment_method", id);
          return;
        }
        const last = await tx.paymentMethod.aggregate({ _max: { position: true } });
        const created = await tx.paymentMethod.create({
          data: {
            ...values,
            logoPublicId,
            position: (last._max.position ?? 0) + 1,
            fields: { create: rows },
          },
        });
        await audit(tx, admin.id, "payment_method.create", "payment_method", created.id);
      });
    } catch (error) {
      if (uploaded) await removeFile("logos", uploaded);
      throw error;
    }
    if (before?.logoPublicId && before.logoPublicId !== logoPublicId)
      await removeFile("logos", before.logoPublicId);
  },
);

export const setMethodEnabled = roleAction(
  "payment-method-enabled",
  "admin",
  setMethodEnabledSchema,
  async ({ id, enabled }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      await findMethod(tx, id);
      if (enabled && !(await tx.paymentField.count({ where: { paymentMethodId: id } })))
        throw new ActionError("Add its account details first.");
      await tx.paymentMethod.update({ where: { id }, data: { enabled } });
      await audit(tx, admin.id, "payment_method.enabled", "payment_method", id, { enabled });
    });
  },
);

/** Swaps a method with its neighbour in the checkout order. */
export const moveMethod = roleAction(
  "move-payment-method",
  "admin",
  moveSchema,
  async ({ id, direction }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const methods = await tx.paymentMethod.findMany({
        where: { archivedAt: null },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: { id: true },
      });
      const order = methods.map((method) => method.id);
      const from = order.indexOf(id);
      const neighbour = order[from + direction];
      if (from < 0 || !neighbour) return;
      order[from] = neighbour;
      order[from + direction] = id;
      for (const [position, methodId] of order.entries())
        await tx.paymentMethod.update({ where: { id: methodId }, data: { position } });
      await audit(tx, admin.id, "payment_method.move", "payment_method", id);
    });
  },
);

/** Deletes an unused method. One that orders were paid with is archived instead. */
export const removePaymentMethod = roleAction(
  "remove-payment-method",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<{ notice: string }> => {
    const result = await db().$transaction(async (tx) => {
      const method = await findMethod(tx, id);
      const used = await tx.order.count({ where: { paymentMethodId: id } });
      if (used)
        await tx.paymentMethod.update({
          where: { id },
          data: { archivedAt: new Date(), enabled: false },
        });
      else await tx.paymentMethod.delete({ where: { id } });
      const action = used ? "payment_method.archive" : "payment_method.delete";
      await audit(tx, admin.id, action, "payment_method", id);
      return { used, logo: method.logoPublicId };
    });
    if (!result.used && result.logo) await removeFile("logos", result.logo);
    return {
      notice: result.used
        ? "Payment method archived. Orders paid with it are kept."
        : "Payment method deleted.",
    };
  },
);

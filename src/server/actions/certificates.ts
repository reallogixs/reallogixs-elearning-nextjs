"use server";

import type { Certificate } from "@/types/domain";
import { idSchema, revokeSchema } from "@/lib/validation/admin";
import { verifyCertificateSchema } from "@/lib/validation/certificate";
import { publicAction, roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { sendCertificate } from "@/server/core/certificates";
import { ActionError } from "@/server/core/errors";
import { clientIp, limit } from "@/server/core/request";
import { db } from "@/server/db";
import { findCertificate } from "@/server/queries/classes";

export const verifyCertificate = publicAction(
  "verify-certificate",
  verifyCertificateSchema,
  async ({ code }): Promise<Certificate> => {
    await limit("verify", await clientIp(), 40, 15);
    const certificate = await findCertificate(code);
    if (!certificate)
      throw new ActionError("No certificate matches this code. Check it and try again.");
    return certificate;
  },
);

export const resendCertificate = roleAction(
  "resend-certificate",
  "admin",
  idSchema,
  async ({ id }, admin): Promise<void> => {
    const certificate = await db().certificate.findUnique({ where: { id } });
    if (!certificate) throw new ActionError("Certificate not found.");
    if (certificate.revokedAt) throw new ActionError("This certificate has been revoked.");
    await audit(db(), admin.id, "certificate.resend", "certificate", id);
    if (!(await sendCertificate(id)))
      throw new ActionError("The email couldn't be sent. Check the email settings.");
  },
);

/** Revoked certificates stay on record, so the verify page can say they're no longer valid. */
export const setCertificateRevoked = roleAction(
  "revoke-certificate",
  "admin",
  revokeSchema,
  async ({ id, revoked }, admin): Promise<void> => {
    await db().$transaction(async (tx) => {
      const certificate = await tx.certificate.findUnique({
        where: { id },
        include: { order: { select: { status: true } } },
      });
      if (!certificate) throw new ActionError("Certificate not found.");
      if (!revoked && certificate.order.status !== "confirmed")
        throw new ActionError("Its order isn't confirmed, so it can't be restored.");
      await tx.certificate.update({
        where: { id },
        data: { revokedAt: revoked ? new Date() : null },
      });
      const action = revoked ? "certificate.revoke" : "certificate.restore";
      await audit(tx, admin.id, action, "certificate", id);
    });
  },
);

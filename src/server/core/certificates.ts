import "server-only";

import { newCertificateCode } from "@/lib/domain/ids";
import { siteUrl } from "@/server/core/env";
import { db, type Tx } from "@/server/db";
import { sendMail } from "@/server/email/send";
import { certificateIssued } from "@/server/email/templates";
import { certificatePdf } from "@/server/files/certificatePdf";

/**
 * One certificate for each student who paid, is registered, and was in the class after it
 * started. There is no minimum stay. Returns the new certificates' ids.
 */
export async function issueCertificates(
  tx: Tx,
  meeting: { id: string; courseId: string; startedAt: Date },
  courseTitle: string,
): Promise<string[]> {
  const orders = await tx.order.findMany({
    where: {
      courseId: meeting.courseId,
      status: "confirmed",
      certificate: null,
      AND: [
        { registrant: { some: { meetingId: meeting.id, revokedAt: null } } },
        {
          registrant: {
            some: {
              meetingId: meeting.id,
              attendance: { some: { leftAt: { gt: meeting.startedAt } } },
            },
          },
        },
      ],
    },
    select: { id: true, contactName: true },
  });
  const created = await tx.certificate.createManyAndReturn({
    data: orders.map((order) => ({
      code: newCertificateCode(),
      orderId: order.id,
      studentName: order.contactName,
      courseTitle,
    })),
    select: { id: true },
  });
  return created.map(({ id }) => id);
}

/** Returns whether it was sent. */
export async function sendCertificate(id: string): Promise<boolean> {
  const { order, ...certificate } = await db().certificate.findUniqueOrThrow({
    where: { id },
    include: { order: { select: { id: true, contactEmail: true } } },
  });
  const email = certificateIssued(certificate.studentName, {
    course: certificate.courseTitle,
    code: certificate.code,
    url: siteUrl(`/certificates/${certificate.code}`),
    verifyUrl: siteUrl("/verify"),
  });
  const content = await certificatePdf({
    ...certificate,
    issuedAt: certificate.issuedAt.toISOString(),
  });
  const filename = `${certificate.code}.pdf`;
  return sendMail(
    order.contactEmail,
    content
      ? { ...email, attachments: [{ filename, content, contentType: "application/pdf" }] }
      : email,
    order.id,
  );
}

const AT_ONCE = 3;

/** A few at a time, so the mail server isn't flooded. Failures can be sent again one by one. */
export async function sendCertificates(ids: string[]): Promise<void> {
  for (let start = 0; start < ids.length; start += AT_ONCE)
    await Promise.allSettled(ids.slice(start, start + AT_ONCE).map(sendCertificate));
}

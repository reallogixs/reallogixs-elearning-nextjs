import type { Certificate, PaymentMethod, SiteContent } from "@/types/domain";
import type { Result } from "@/types/forms";
import { newCertificateCode, newId } from "@/lib/domain/ids";
import { paymentMethodSchema, type PaymentMethodFormValues } from "@/lib/validation/admin";
import { validateWith } from "@/lib/validation/validate";

import { fail, latency, nowIso, ok, read, replaceById, write } from "./client";

/* Payment methods -------------------------------------------------------- */

export async function savePaymentMethod(
  input: PaymentMethodFormValues,
  id?: string,
): Promise<Result<PaymentMethod>> {
  await latency();
  const checked = await validateWith(paymentMethodSchema, input);
  if (!checked.ok) return checked;
  const values = checked.data;
  const db = read();
  const existing = id ? db.paymentMethods.find((method) => method.id === id) : undefined;
  const method: PaymentMethod = {
    ...values,
    logoUrl: values.logoUrl ?? null,
    id: existing?.id ?? newId("pm"),
    order: existing?.order ?? db.paymentMethods.length + 1,
  };
  write((current) => ({
    ...current,
    paymentMethods: existing
      ? replaceById(current.paymentMethods, method.id, () => method)
      : [...current.paymentMethods, method],
  }));
  return ok(method);
}

export async function setPaymentMethodEnabled(id: string, enabled: boolean): Promise<Result> {
  await latency(150);
  write((db) => ({
    ...db,
    paymentMethods: replaceById(db.paymentMethods, id, (method) => ({ ...method, enabled })),
  }));
  return ok(undefined);
}

/** Swaps a method with its neighbour in the checkout order. */
export async function movePaymentMethod(id: string, direction: -1 | 1): Promise<Result> {
  const sorted = [...read().paymentMethods].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((method) => method.id === id);
  const swap = sorted[index + direction];
  const target = sorted[index];
  if (!swap || !target) return ok(undefined);
  write((db) => ({
    ...db,
    paymentMethods: db.paymentMethods.map((method) =>
      method.id === target.id
        ? { ...method, order: swap.order }
        : method.id === swap.id
          ? { ...method, order: target.order }
          : method,
    ),
  }));
  return ok(undefined);
}

export async function deletePaymentMethod(id: string): Promise<Result> {
  await latency();
  if (read().orders.some((order) => order.paymentMethodId === id)) {
    return fail("Orders were paid with this method. Disable it instead of deleting.");
  }
  write((db) => ({
    ...db,
    paymentMethods: db.paymentMethods.filter((method) => method.id !== id),
  }));
  return ok(undefined);
}

/* Site content ----------------------------------------------------------- */

export async function saveContent<K extends keyof SiteContent>(
  section: K,
  value: SiteContent[K],
): Promise<Result> {
  await latency();
  write((db) => ({ ...db, content: { ...db.content, [section]: value } }));
  return ok(undefined);
}

/* Certificates ----------------------------------------------------------- */

export async function issueCertificate(orderId: string): Promise<Result<Certificate>> {
  await latency();
  const db = read();
  const order = db.orders.find((candidate) => candidate.id === orderId);
  const course = db.courses.find((candidate) => candidate.id === order?.courseId);
  if (!order || !course) return fail("Order not found.");
  if (order.status !== "confirmed")
    return fail("Only confirmed enrolments can receive a certificate.");
  if (db.certificates.some((certificate) => certificate.orderId === orderId))
    return fail("A certificate already exists.");
  const certificate: Certificate = {
    id: newId("crt"),
    code: newCertificateCode(),
    orderId,
    studentName: order.contact.name,
    courseTitle: course.title,
    issuedAt: nowIso(),
  };
  write((current) => ({ ...current, certificates: [certificate, ...current.certificates] }));
  return ok(certificate);
}

export async function revokeCertificate(id: string): Promise<Result> {
  await latency();
  write((db) => ({
    ...db,
    certificates: db.certificates.filter((certificate) => certificate.id !== id),
  }));
  return ok(undefined);
}

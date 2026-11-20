import * as yup from "yup";

import { emailSchema, nameSchema, phoneSchema } from "./shared";

export const contactSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});
export type ContactInput = yup.InferType<typeof contactSchema>;

export const promoCodeSchema = yup.object({
  code: yup
    .string()
    .trim()
    .required("Enter a code, or continue without one.")
    .max(20, "That code looks too long."),
});

export const paymentChoiceSchema = yup.object({
  methodId: yup.string().required("Choose how you'll pay."),
});

export const RECEIPT_MAX_BYTES = 4 * 1024 * 1024;
export const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Any uploaded image/PDF: type and size are checked by the schema, not by hand. */
export function fileSchema(
  types: string[],
  maxBytes: number,
  typeMessage: string,
  sizeMessage: string,
) {
  return yup
    .mixed<File>()
    .nullable()
    .required("Choose a file to upload.")
    .test("file-type", typeMessage, (file) => !file || types.includes(file.type))
    .test("file-size", sizeMessage, (file) => !file || file.size <= maxBytes);
}

export const receiptSchema = yup.object({
  transactionRef: yup
    .string()
    .trim()
    .required("Enter the transaction ID or reference from your receipt.")
    .min(4, "That reference looks too short.")
    .max(40, "That reference looks too long."),
  file: fileSchema(
    RECEIPT_TYPES,
    RECEIPT_MAX_BYTES,
    "Upload a JPG, PNG, WebP or PDF file.",
    "That file is over 4 MB. Try a screenshot instead of a photo.",
  ),
});
export type ReceiptInput = yup.InferType<typeof receiptSchema>;

export const orderLookupSchema = yup.object({
  orderId: yup
    .string()
    .trim()
    .uppercase()
    .required("Enter your order number.")
    .matches(/^RLX-[A-Z0-9]{5,6}$/, "Order numbers look like RLX-4F7K2."),
  phone: phoneSchema,
});
export type OrderLookupInput = yup.InferType<typeof orderLookupSchema>;

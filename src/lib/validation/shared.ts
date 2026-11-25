import * as yup from "yup";

/** Pakistani mobile: 0300 1234567, +92 300 1234567, 03001234567 … */
export const phoneSchema = yup
  .string()
  .trim()
  .required("Enter your mobile number.")
  .matches(/^(?:\+?92|0)[\s-]?3\d{2}[\s-]?\d{7}$/, "Enter a mobile number like 0300 1234567.");

export const emailSchema = yup
  .string()
  .trim()
  .required("Enter your email.")
  .email("Enter a valid email address.");

export const nameSchema = yup
  .string()
  .trim()
  .required("Enter the full name.")
  .min(2, "Enter the full name.")
  .max(80, "Keep the name under 80 characters.");

export const passwordSchema = yup
  .string()
  .required("Enter a password.")
  .min(8, "Use at least 8 characters.")
  .max(72, "Keep it under 72 characters.");

export const percentSchema = yup
  .number()
  .typeError("Enter a number.")
  .required("Enter a percentage.")
  .min(0, "Can't be below 0.")
  .max(100, "Can't be above 100.");

/** Any UUID version. Yup's own rule rejects version 7, which our database uses. */
export const uuidSchema = yup.string().matches(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, {
  message: "That record id isn't valid.",
  excludeEmptyString: true,
});

export const slugSchema = yup
  .string()
  .trim()
  .required("Add a URL slug.")
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lower-case letters, numbers and dashes.");

export const requiredText = (message: string): yup.StringSchema<string> =>
  yup.string().trim().required(message);

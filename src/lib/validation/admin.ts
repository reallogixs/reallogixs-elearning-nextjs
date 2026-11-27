import * as yup from "yup";

import { fileSchema, orderNumberSchema } from "./checkout";
import {
  emailSchema,
  nameSchema,
  percentSchema,
  phoneSchema,
  requiredText,
  slugSchema,
  uuidSchema,
} from "./shared";

const wholeNumber = (label: string, min: number) =>
  yup
    .number()
    .typeError(`Enter the ${label}.`)
    .required(`Enter the ${label}.`)
    .integer("Use a whole number.")
    .min(min, `At least ${min}.`);

export const courseSchema = yup.object({
  title: requiredText("Add a course title.").min(4, "Add a course title."),
  slug: slugSchema,
  summary: requiredText("Add a one-line summary.")
    .min(10, "Add a one-line summary.")
    .max(160, "Keep the summary under 160 characters."),
  description: requiredText("Describe the course in a few sentences.").min(
    20,
    "Describe the course in a few sentences.",
  ),
  categoryId: uuidSchema.required("Choose a category."),
  instructorId: uuidSchema.required("Choose an instructor."),
  /** Pakistan time, as a datetime-local value: 2026-12-12T20:00 */
  startsAt: yup
    .string()
    .required("Pick the class date and time.")
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick a full date and time."),
  durationMinutes: wholeNumber("length in minutes", 15).max(720, "Up to 720 minutes."),
  seats: wholeNumber("number of seats", 1).max(1000, "Up to 1,000 seats."),
  price: wholeNumber("price", 0),
  level: yup
    .mixed<"beginner" | "intermediate" | "advanced">()
    .oneOf(["beginner", "intermediate", "advanced"])
    .required(),
  outcomes: requiredText("Add at least one outcome (one per line)."),
  status: yup.mixed<"draft" | "published">().oneOf(["draft", "published"]).required(),
  enrolmentOpen: yup.boolean().required(),
  featured: yup.boolean().required(),
  /** A new banner as a data URL, the current one's address, or null for none. */
  bannerUrl: yup.string().nullable().default(null),
});
export type CourseFormValues = yup.InferType<typeof courseSchema>;

export const categorySchema = yup.object({
  name: requiredText("Add a name.").min(2, "Add a name."),
  slug: slugSchema,
  /** "" means top level. Formik sends empty fields as undefined, so default to "". */
  parentId: uuidSchema.default(""),
  description: yup.string().trim().max(200, "Keep it under 200 characters.").default(""),
});
export type CategoryFormValues = yup.InferType<typeof categorySchema>;

export const instructorSchema = yup.object({
  name: nameSchema,
  title: requiredText("Add a role or title."),
  bio: requiredText("Add a short bio.").min(10, "Add a short bio."),
});
export type InstructorFormValues = yup.InferType<typeof instructorSchema>;

export const teacherSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  promoCode: yup
    .string()
    .trim()
    .uppercase()
    .default("")
    .matches(/^([A-Z0-9-]{4,16})?$/, "4–16 letters, numbers or dashes."),
  commissionPct: percentSchema,
  discountPct: percentSchema,
});
export type TeacherFormValues = yup.InferType<typeof teacherSchema>;

export const BANNER_MAX_BYTES = 3 * 1024 * 1024;
export const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const bannerFileSchema = yup.object({
  banner: fileSchema(
    BANNER_TYPES,
    12 * 1024 * 1024,
    "Use a JPG, PNG or WebP image.",
    "That image is over 12 MB.",
  ),
});

export const LOGO_MAX_BYTES = 512 * 1024;
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export const logoFileSchema = yup.object({
  logo: fileSchema(
    LOGO_TYPES,
    LOGO_MAX_BYTES,
    "Use a PNG, JPG, WebP or SVG logo.",
    "Keep the logo under 512 KB.",
  ),
});

export const paymentFieldSchema = yup.object({
  id: yup.string().required(),
  label: requiredText("Add a label, e.g. IBAN."),
  value: requiredText("Add the value."),
  copyable: yup.boolean().required(),
});

export const paymentMethodSchema = yup.object({
  name: requiredText("Add the method name, e.g. JazzCash."),
  logoUrl: yup.string().nullable().default(null),
  fields: yup
    .array(paymentFieldSchema)
    .required()
    .min(1, "Add at least one detail row, e.g. Account number."),
  instructions: requiredText("Tell students how to pay."),
  enabled: yup.boolean().required(),
});
export type PaymentMethodFormValues = yup.InferType<typeof paymentMethodSchema>;

export const rejectSchema = yup.object({
  reason: requiredText("Tell the student what to fix.").min(
    8,
    "Give a little more detail so the student can fix it.",
  ),
});

export const payoutSchema = yup.object({
  reference: requiredText("Add the transfer reference.").min(3, "Add the transfer reference."),
});

export const registrantEmailSchema = yup.object({ email: emailSchema });

export const idSchema = yup.object({ id: uuidSchema.required() });
/** Empty when creating. */
const optionalId = yup.object({ id: uuidSchema.default("") });

export const saveCourseSchema = courseSchema.concat(optionalId);
export const setEnrolmentSchema = idSchema.shape({ open: yup.boolean().required() });
export const saveCategorySchema = categorySchema.concat(optionalId);
export const moveSchema = idSchema.shape({
  direction: yup.mixed<-1 | 1>().oneOf([-1, 1]).required(),
});
export const saveInstructorSchema = instructorSchema.concat(optionalId);
export const updateTeacherSchema = teacherSchema.concat(idSchema);
export const teacherActiveSchema = idSchema.shape({ active: yup.boolean().required() });

export const orderSchema = yup.object({ number: orderNumberSchema });
export const rejectOrderSchema = orderSchema.concat(rejectSchema);
export const changeRegistrantSchema = orderSchema.concat(registrantEmailSchema);
export const payTeacherSchema = payoutSchema.shape({
  teacherId: uuidSchema.required(),
  /** What the admin was shown and paid. */
  expectedAmount: yup.number().required().integer().min(1),
});
export const savePaymentMethodSchema = paymentMethodSchema.concat(optionalId);
export const setMethodEnabledSchema = idSchema.shape({ enabled: yup.boolean().required() });
export const revokeSchema = idSchema.shape({ revoked: yup.boolean().required() });

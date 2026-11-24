import * as yup from "yup";

import { fileSchema } from "./checkout";
import {
  emailSchema,
  nameSchema,
  percentSchema,
  phoneSchema,
  requiredText,
  slugSchema,
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
  categoryId: yup.string().required("Choose a category."),
  instructorId: yup.string().required("Choose an instructor."),
  mode: yup.mixed<"physical" | "online">().oneOf(["physical", "online"]).required(),
  venue: requiredText("Add the campus address or online platform."),
  schedule: requiredText("Add the class days and times."),
  startDate: yup.string().required("Pick a start date."),
  durationWeeks: wholeNumber("duration", 1).max(104, "Up to 104 weeks."),
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
});
export type CourseFormValues = yup.InferType<typeof courseSchema>;

export const categorySchema = yup.object({
  name: requiredText("Add a name.").min(2, "Add a name."),
  slug: slugSchema,
  /** "" means top level. Formik sends empty fields as undefined, so default to "". */
  parentId: yup.string().default(""),
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

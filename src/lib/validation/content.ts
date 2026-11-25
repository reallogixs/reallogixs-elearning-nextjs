import * as yup from "yup";

import { emailSchema, requiredText } from "./shared";

const text = (label: string) => requiredText(`${label} can't be empty.`);

/** Optional copy: may be left empty, but not too long. */
const optionalText = (max: number) =>
  // Formik sends empty fields as undefined; default("") keeps them as empty strings.
  yup.string().trim().max(max, `Keep it under ${max} characters.`).default("");

export const heroSchema = yup.object({
  badge: text("Badge").max(12, "Keep the badge under 12 characters."),
  eyebrow: text("Label"),
  title: text("Headline"),
  highlight: text("Highlighted words"),
  subtitle: text("Intro"),
  primaryCta: text("Main button"),
  secondaryCta: text("Second button"),
  upcomingLabel: text("Upcoming batches label"),
});

export const sectionCopySchema = yup.object({
  label: text("Label"),
  title: text("Heading"),
  highlight: optionalText(60),
  description: optionalText(220),
});

export const pageCopySchema = yup.object({
  label: text("Label"),
  title: text("Heading"),
  body: text("Intro"),
});

export const authPageCopySchema = pageCopySchema.shape({
  asideTitle: text("Panel heading"),
  asideBody: text("Panel text"),
});

export const coursePageSchema = yup.object({
  aboutLabel: text("Description label"),
  outcomesLabel: text("Outcomes label"),
  instructorLabel: text("Instructor label"),
  enrolNote: text("Enrol note"),
});

export const communitySchema = yup.object({
  whatsappUrl: yup
    .string()
    .trim()
    .required("Add the WhatsApp invite link.")
    .url("Enter a full link starting with https://")
    .matches(
      /^https:\/\/(chat\.whatsapp\.com|wa\.me|whatsapp\.com\/channel)\//,
      "Use a chat.whatsapp.com or wa.me link.",
    ),
  title: text("Heading"),
  body: text("Message"),
});

export const contactContentSchema = yup.object({
  email: emailSchema,
  phone: text("Phone"),
  whatsapp: text("WhatsApp"),
  address: text("Address"),
});

export const checkoutContentSchema = yup.object({
  promoHelp: text("Promo help"),
  receiptHelp: text("Receipt help"),
  pendingMessage: text("Message"),
});

export const footerSchema = yup.object({
  headline: text("Headline"),
  highlight: optionalText(40),
  ctaLabel: text("Button"),
  blurb: text("About text"),
  tagline: text("Bottom line"),
});

export const statsSchema = yup.object({
  items: yup.array(yup.object({ value: text("Number"), label: text("Label") })).required(),
});

export const stepsSchema = yup.object({
  items: yup.array(yup.object({ title: text("Title"), body: text("Text") })).required(),
});

export const testimonialsSchema = yup.object({
  items: yup
    .array(
      yup.object({
        id: yup.string().required(),
        name: text("Name"),
        role: text("Role"),
        quote: text("Quote"),
        isPlaceholder: yup.boolean().required(),
      }),
    )
    .required(),
});

export const faqsSchema = yup.object({
  items: yup
    .array(
      yup.object({
        id: yup.string().required(),
        question: text("Question"),
        answer: text("Answer"),
      }),
    )
    .required(),
});

export const contentBlockSchema = yup.object({
  key: yup.string().required(),
  /** Checked again with the block's own schema. */
  value: yup.mixed<object>().required(),
});

export const contentListSchema = yup.object({
  list: yup
    .mixed<"faqs" | "testimonials" | "steps" | "stats">()
    .oneOf(["faqs", "testimonials", "steps", "stats"])
    .required(),
  items: yup.array(yup.mixed<object>().required()).max(50, "That's too many items.").required(),
});

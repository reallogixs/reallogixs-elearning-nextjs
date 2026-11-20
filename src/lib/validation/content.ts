import * as yup from "yup";

import { emailSchema, requiredText } from "./shared";

const text = (label: string) => requiredText(`${label} can't be empty.`);

export const heroSchema = yup.object({
  eyebrow: text("Label"),
  title: text("Headline"),
  highlight: text("Highlighted words"),
  subtitle: text("Intro"),
  primaryCta: text("Main button"),
  secondaryCta: text("Second button"),
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

export const footerSchema = yup.object({ blurb: text("About text") });

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

"use server";

import { updateTag } from "next/cache";
import type { AnyObjectSchema, InferType } from "yup";

import {
  authPageCopySchema,
  checkoutContentSchema,
  communitySchema,
  contactContentSchema,
  contentBlockSchema,
  contentListSchema,
  coursePageSchema,
  faqsSchema,
  footerSchema,
  heroSchema,
  pageCopySchema,
  sectionCopySchema,
  statsSchema,
  stepsSchema,
  testimonialsSchema,
} from "@/lib/validation/content";
import { validateWith } from "@/lib/validation/validate";
import { roleAction } from "@/server/core/action";
import { audit } from "@/server/core/audit";
import { ActionError } from "@/server/core/errors";
import { TAG } from "@/server/core/tags";
import { db } from "@/server/db";

/** Every block an admin can save, with the schema its form uses. */
const BLOCKS: Record<string, AnyObjectSchema> = {
  hero: heroSchema,
  coursePage: coursePageSchema,
  community: communitySchema,
  contact: contactContentSchema,
  checkout: checkoutContentSchema,
  footer: footerSchema,
  "sections.featured": sectionCopySchema,
  "sections.categories": sectionCopySchema,
  "sections.howItWorks": sectionCopySchema,
  "sections.stats": sectionCopySchema,
  "sections.testimonials": sectionCopySchema,
  "sections.faq": sectionCopySchema,
  "pages.courses": pageCopySchema,
  "pages.track": pageCopySchema,
  "pages.verify": pageCopySchema,
  "pages.login": authPageCopySchema,
  "pages.signup": authPageCopySchema,
};

async function checked<S extends AnyObjectSchema>(
  schema: S,
  value: unknown,
): Promise<InferType<S>> {
  const result = await validateWith(schema, value);
  if (!result.ok) throw new ActionError(result.error);
  return result.data;
}

export const saveContentBlock = roleAction(
  "content-block",
  "admin",
  contentBlockSchema,
  async ({ key, value }, admin): Promise<void> => {
    const schema = Object.hasOwn(BLOCKS, key) ? BLOCKS[key] : undefined;
    if (!schema) throw new ActionError("That section doesn't exist.");
    const data = await checked(schema, value);
    await db().$transaction(async (tx) => {
      await tx.contentBlock.upsert({
        where: { key },
        create: { key, value: data },
        update: { value: data },
      });
      await audit(tx, admin.id, "content.save", "content", key);
    });
    updateTag(TAG.content);
  },
);

/** Saves a whole list in its new order. */
export const saveContentList = roleAction(
  "content-list",
  "admin",
  contentListSchema,
  async ({ list, items }, admin): Promise<void> => {
    const value = { items };
    await db().$transaction(async (tx) => {
      if (list === "faqs") {
        const rows = (await checked(faqsSchema, value)).items;
        await tx.faq.deleteMany();
        await tx.faq.createMany({
          data: rows.map(({ question, answer }, position) => ({ question, answer, position })),
        });
      } else if (list === "testimonials") {
        const rows = (await checked(testimonialsSchema, value)).items;
        await tx.testimonial.deleteMany();
        await tx.testimonial.createMany({
          data: rows.map(({ name, role, quote, isPlaceholder }, position) => ({
            name,
            role,
            quote,
            isPlaceholder,
            position,
          })),
        });
      } else if (list === "steps") {
        const rows = (await checked(stepsSchema, value)).items;
        await tx.processStep.deleteMany();
        await tx.processStep.createMany({
          data: rows.map((row, position) => ({ ...row, position })),
        });
      } else {
        const rows = (await checked(statsSchema, value)).items;
        await tx.siteStat.deleteMany();
        await tx.siteStat.createMany({ data: rows.map((row, position) => ({ ...row, position })) });
      }
      await audit(tx, admin.id, "content.save", "content", list);
    });
    updateTag(TAG.content);
  },
);

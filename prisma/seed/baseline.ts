import type { Category } from "../../src/types/domain";
import { createSeed } from "../../src/mocks/seed";
import type { PrismaClient } from "../../src/server/db/generated/client";

import { uuid } from "./ids";

/** Parents first, so foreign keys always exist. */
function parentsFirst(categories: Category[], parentId: string | null = null): Category[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .flatMap((category) => [category, ...parentsFirst(categories, category.id)]);
}

/**
 * What every database starts with: site text, categories, and payment methods that stay hidden
 * until real account numbers are added. Existing rows are never overwritten.
 */
export async function seedBaseline(db: PrismaClient): Promise<void> {
  const { categories, paymentMethods, content } = createSeed();
  const { stats, steps, testimonials, faqs, sections, pages, ...single } = content;

  const blocks: Record<string, object> = { ...single };
  for (const [key, value] of Object.entries(sections)) blocks[`sections.${key}`] = value;
  for (const [key, value] of Object.entries(pages)) blocks[`pages.${key}`] = value;
  await db.contentBlock.createMany({
    data: Object.entries(blocks).map(([key, value]) => ({ key, value: value as never })),
    skipDuplicates: true,
  });

  if ((await db.faq.count()) === 0)
    await db.faq.createMany({
      data: faqs.map(({ question, answer }, position) => ({ question, answer, position })),
    });
  if ((await db.processStep.count()) === 0)
    await db.processStep.createMany({
      data: steps.map((step, position) => ({ ...step, position })),
    });

  for (const category of parentsFirst(categories)) {
    const data = {
      id: uuid(category.id),
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      parentId: category.parentId && uuid(category.parentId),
      position: category.order,
    };
    await db.category.upsert({ where: { id: data.id }, create: data, update: {} });
  }

  for (const method of paymentMethods) {
    await db.paymentMethod.upsert({
      where: { id: uuid(method.id) },
      update: {},
      create: {
        id: uuid(method.id),
        name: method.name,
        instructions: method.instructions,
        enabled: false,
        position: method.order,
      },
    });
  }
  // Sample numbers and quotes are demo-only: nothing invented goes into a real database.
  void [stats, testimonials];
}

import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { SiteContent } from "@/types/domain";
import { siteContent as defaults } from "@/mocks/content";
import { TAG } from "@/server/core/tags";
import { db } from "@/server/db";

const order = { orderBy: { position: "asc" } } as const;

async function load(): Promise<SiteContent> {
  const client = db();
  const [blocks, stats, steps, testimonials, faqs] = await Promise.all([
    client.contentBlock.findMany(),
    client.siteStat.findMany(order),
    client.processStep.findMany(order),
    client.testimonial.findMany(order),
    client.faq.findMany(order),
  ]);
  const saved = new Map(blocks.map((block) => [block.key, block.value]));

  /** Saved text wins; a field added later falls back to its default until it is saved. */
  function block<T extends object>(key: string, fallback: T): T {
    const value = saved.get(key);
    return value && typeof value === "object" && !Array.isArray(value)
      ? { ...fallback, ...(value as Partial<T>) }
      : fallback;
  }
  function group<T extends Record<string, object>>(name: string, fallback: T): T {
    return Object.fromEntries(
      Object.entries(fallback).map(([key, value]) => [key, block(`${name}.${key}`, value)]),
    ) as T;
  }

  return {
    hero: block("hero", defaults.hero),
    coursePage: block("coursePage", defaults.coursePage),
    community: block("community", defaults.community),
    contact: block("contact", defaults.contact),
    checkout: block("checkout", defaults.checkout),
    footer: block("footer", defaults.footer),
    sections: group("sections", { ...defaults.sections }),
    pages: group("pages", { ...defaults.pages }),
    stats: stats.map(({ label, value }) => ({ label, value })),
    steps: steps.map(({ title, body }) => ({ title, body })),
    testimonials: testimonials.map(({ id, name, role, quote, isPlaceholder }) => ({
      id,
      name,
      role,
      quote,
      isPlaceholder,
    })),
    faqs: faqs.map(({ id, question, answer }) => ({ id, question, answer })),
  };
}

/** All editable site text. */
export const getContent = cache(unstable_cache(load, ["site-content"], { tags: [TAG.content] }));

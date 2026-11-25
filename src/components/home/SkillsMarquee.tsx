"use client";

import { Fragment, type ReactElement } from "react";

import { useCatalogue } from "@/components/data/SiteData";
import { ScrollMarquee } from "@/components/motion/ScrollMarquee";

/**
 * Big outline marquee (main site M8, scroll-linked). Decorative: the same categories
 * are real links in the section below, so it is hidden from assistive technology.
 */
export function SkillsMarquee(): ReactElement | null {
  const words = useCatalogue()
    .categories.filter((category) => category.parentId !== null)
    .map((category) => category.name);

  if (words.length === 0) return null;
  return (
    <section aria-hidden="true" className="overflow-hidden bg-white py-10 lg:py-14">
      <ScrollMarquee>
        {words.map((word) => (
          <Fragment key={word}>
            <span className="px-6 py-[0.14em] font-display text-marquee whitespace-nowrap text-outline lg:px-10">
              {word}
            </span>
            <span className="size-[0.16em] shrink-0 rounded-full bg-sky-400 text-marquee" />
          </Fragment>
        ))}
      </ScrollMarquee>
    </section>
  );
}

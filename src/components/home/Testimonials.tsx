"use client";

import type { ReactElement } from "react";
import { Quote } from "lucide-react";

import { initials } from "@/lib/domain/format";
import { useContent } from "@/components/data/SiteData";
import { Grain } from "@/components/motion/Grain";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Deep-gradient band with grain and glass quote cards (main site testimonials look). */
export function Testimonials(): ReactElement | null {
  const { testimonials, sections } = useContent();
  const copy = sections.testimonials;
  if (testimonials.length === 0) return null;
  return (
    <section
      aria-labelledby="stories-title"
      className="on-dark relative isolate overflow-hidden bg-gradient-deep py-section text-white"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-glow" />
      <Grain />
      <div className="shell flex flex-col gap-section-gap">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="flex flex-col gap-4">
            <SectionLabel tone="dark">{copy.label}</SectionLabel>
            <h2 id="stories-title" className="text-display text-white">
              {copy.title}{" "}
              {copy.highlight ? (
                <span className="text-gradient-light">{copy.highlight}</span>
              ) : null}
            </h2>
          </div>
          <p className="text-body-lg text-on-dark lg:pb-3">{copy.description}</p>
        </div>
        <Reveal
          as="ul"
          stagger
          className="-mx-gutter flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-gutter pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0"
        >
          {testimonials.map((testimonial) => (
            <li key={testimonial.id} className="w-[85%] shrink-0 snap-start md:w-auto">
              <figure className="flex h-full min-h-[20rem] flex-col gap-6 rounded-lg border border-white/12 bg-navy-950/45 p-7 backdrop-blur-sm">
                <Quote aria-hidden="true" className="size-8 fill-sky-400/20 text-sky-300" />
                <blockquote className="flex-1 text-body-lg text-white">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-white/12 pt-5">
                  <span
                    aria-hidden="true"
                    className="flex size-11 items-center justify-center rounded-pill bg-white text-small font-semibold text-navy-900"
                  >
                    {initials(testimonial.name)}
                  </span>
                  <span className="text-small">
                    <span className="block font-medium text-white">{testimonial.name}</span>
                    <span className="text-on-dark-soft">{testimonial.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

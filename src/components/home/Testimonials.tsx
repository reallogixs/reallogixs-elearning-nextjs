"use client";

import type { ReactElement } from "react";
import { Quote } from "lucide-react";

import { initials } from "@/lib/domain/format";
import { useDb } from "@/lib/store/hooks";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Testimonials(): ReactElement | null {
  const { testimonials } = useDb().content;
  if (testimonials.length === 0) return null;
  return (
    <Section labelledBy="stories-title">
      <SectionHeading
        id="stories-title"
        label="Student stories"
        title="Builders, not just learners"
      />
      <Reveal stagger className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="flex flex-col gap-6 rounded-lg border border-line bg-white p-6 transition-shadow duration-base hover:shadow-card"
          >
            <Quote aria-hidden="true" className="size-7 fill-sky-100 text-sky-400" />
            <blockquote className="flex-1 text-body-lg">{testimonial.quote}</blockquote>
            <figcaption className="flex items-center gap-3 border-t border-line pt-5">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-pill bg-gradient-logic text-small font-medium text-white"
              >
                {initials(testimonial.name)}
              </span>
              <span className="text-small">
                <span className="block font-medium">{testimonial.name}</span>
                <span className="text-ink-soft">{testimonial.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </Section>
  );
}

"use client";

import type { ReactElement } from "react";

import { useContent } from "@/components/data/SiteData";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

import { ContentHeading } from "./ContentHeading";

export function FaqSection(): ReactElement | null {
  const { faqs, contact, sections } = useContent();
  if (faqs.length === 0) return null;
  return (
    <Section
      id="faq"
      tone="mist"
      labelledBy="faq-title"
      innerClassName="grid gap-section-gap lg:grid-cols-[1fr_1.6fr]"
    >
      <div className="flex flex-col gap-6">
        <ContentHeading id="faq-title" copy={sections.faq} />
        <div>
          <Button href={`mailto:${contact.email}`} variant="secondary" size="sm">
            Email us
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-line bg-white px-6">
        <Accordion
          items={faqs.map((faq) => ({ id: faq.id, title: faq.question, body: faq.answer }))}
        />
      </div>
    </Section>
  );
}

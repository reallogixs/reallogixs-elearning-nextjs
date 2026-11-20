"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FaqSection(): ReactElement {
  const { faqs, contact } = useDb().content;
  return (
    <Section
      id="faq"
      tone="mist"
      labelledBy="faq-title"
      innerClassName="grid gap-section-gap lg:grid-cols-[1fr_1.6fr]"
    >
      <div className="flex flex-col gap-6">
        <SectionHeading
          id="faq-title"
          label="FAQ"
          title="Questions, answered"
          description="Can't find what you need? We reply quickly."
        />
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

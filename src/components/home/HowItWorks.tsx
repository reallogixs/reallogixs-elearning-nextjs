"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HowItWorks(): ReactElement {
  const { steps } = useDb().content;
  return (
    <Section id="how-it-works" tone="mesh" labelledBy="how-title">
      <div aria-hidden="true" className="absolute inset-0 bg-grid-dark" />
      <SectionHeading
        id="how-title"
        tone="dark"
        label="How it works"
        title="From browsing to your first class in four steps"
      />
      <Reveal as="ol" stagger className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex flex-col gap-4 rounded-md glass p-6">
            <span className="flex size-10 items-center justify-center rounded-pill bg-white font-mono text-small font-medium text-navy-900">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-h4 text-white">{step.title}</h3>
            <p className="text-small text-on-dark">{step.body}</p>
          </li>
        ))}
      </Reveal>
    </Section>
  );
}

"use client";

import type { ReactElement } from "react";

import { useContent } from "@/components/data/SiteData";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";

import { ContentHeading } from "./ContentHeading";

export function HowItWorks(): ReactElement | null {
  const { steps, sections } = useContent();
  if (steps.length === 0) return null;
  return (
    <Section id="how-it-works" tone="mesh" labelledBy="how-title">
      <div aria-hidden="true" className="absolute inset-0 bg-grid-dark" />
      <ContentHeading id="how-title" tone="dark" copy={sections.howItWorks} />
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

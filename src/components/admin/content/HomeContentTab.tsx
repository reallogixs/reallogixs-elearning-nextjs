"use client";

import type { ReactElement } from "react";

import type { SiteContent } from "@/types/domain";
import { settingsApi } from "@/lib/api";
import { newId } from "@/lib/domain/ids";
import {
  faqsSchema,
  heroSchema,
  sectionCopySchema,
  statsSchema,
  stepsSchema,
  testimonialsSchema,
} from "@/lib/validation/content";

import { ContentListSection } from "./ContentListSection";
import { ContentSection } from "./ContentSection";
import { SECTION_FIELDS } from "./sectionFields";

type SectionKey = keyof SiteContent["sections"];

/** Every home page section, top to bottom, in the order visitors see them. */
export function HomeContentTab({ content }: { content: SiteContent }): ReactElement {
  const heading = (key: SectionKey, title: string, description: string): ReactElement => (
    <ContentSection
      title={title}
      description={description}
      value={content.sections[key]}
      fields={SECTION_FIELDS}
      schema={sectionCopySchema}
      onSave={(value) => settingsApi.saveContentEntry("sections", key, value)}
    />
  );

  return (
    <>
      <ContentSection
        title="Hero"
        description="The dark banner at the top of the home page."
        value={content.hero}
        fields={[
          { key: "badge", label: "Badge", hint: "Short word in the pill, e.g. New." },
          { key: "eyebrow", label: "Pill text" },
          { key: "title", label: "Headline" },
          {
            key: "highlight",
            label: "Highlighted line",
            hint: "Second line, in the brand gradient.",
          },
          { key: "primaryCta", label: "Main button" },
          { key: "secondaryCta", label: "Second button" },
          {
            key: "upcomingLabel",
            label: "Upcoming classes label",
            hint: "Above the three next-class links.",
          },
          { key: "subtitle", label: "Intro paragraph", kind: "multiline" },
        ]}
        schema={heroSchema}
        onSave={(value) => settingsApi.saveContent("hero", value)}
      />
      {heading(
        "featured",
        "Featured courses section",
        "Heading above the featured course cards. Pick which courses are featured in Courses.",
      )}
      {heading(
        "categories",
        "Categories section",
        "Heading above the category grid. Categories come from Catalogue → Categories.",
      )}
      {heading("howItWorks", "How it works section", "Heading for the steps below.")}
      <ContentListSection
        title="How it works steps"
        itemLabel="Step"
        items={content.steps}
        fields={[
          { key: "title", label: "Title" },
          { key: "body", label: "Text", kind: "multiline" },
        ]}
        schema={stepsSchema}
        createItem={() => ({ title: "", body: "" })}
        onSave={(items) => settingsApi.saveContent("steps", items)}
      />
      {heading("stats", "Numbers section", "Heading above the count-up numbers.")}
      <ContentListSection
        title="Numbers"
        description='Numbers count up on the page, e.g. "1,200+" or "4.8/5".'
        itemLabel="Number"
        items={content.stats}
        fields={[
          { key: "value", label: "Number" },
          { key: "label", label: "Label" },
        ]}
        schema={statsSchema}
        createItem={() => ({ value: "", label: "" })}
        onSave={(items) => settingsApi.saveContent("stats", items)}
      />
      {heading("testimonials", "Student stories section", "Heading on the gradient band.")}
      <ContentListSection
        title="Testimonials"
        itemLabel="Testimonial"
        items={content.testimonials}
        fields={[
          { key: "name", label: "Name" },
          { key: "role", label: "Course / role" },
          { key: "quote", label: "Quote", kind: "multiline" },
          {
            key: "isPlaceholder",
            label: "Placeholder",
            kind: "boolean",
            hint: "Flag sample quotes so they're easy to replace.",
          },
        ]}
        schema={testimonialsSchema}
        createItem={() => ({
          id: newId("tst"),
          name: "",
          role: "",
          quote: "",
          isPlaceholder: false,
        })}
        onSave={(items) => settingsApi.saveContent("testimonials", items)}
      />
      {heading("faq", "FAQ section", "Heading beside the questions.")}
      <ContentListSection
        title="FAQs"
        itemLabel="Question"
        items={content.faqs}
        fields={[
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", kind: "multiline" },
        ]}
        schema={faqsSchema}
        createItem={() => ({ id: newId("faq"), question: "", answer: "" })}
        onSave={(items) => settingsApi.saveContent("faqs", items)}
      />
    </>
  );
}

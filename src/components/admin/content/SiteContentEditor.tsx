"use client";

import type { ReactElement } from "react";

import { settingsApi } from "@/lib/api";
import {
  checkoutContentSchema,
  communitySchema,
  contactContentSchema,
  faqsSchema,
  footerSchema,
  heroSchema,
  statsSchema,
  stepsSchema,
  testimonialsSchema,
} from "@/lib/validation/content";
import { newId } from "@/lib/domain/ids";
import { useDb, useHydrated } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

import { ContentListSection } from "./ContentListSection";
import { ContentSection } from "./ContentSection";

/** Every piece of public copy, editable without a developer. */
export function SiteContentEditor(): ReactElement {
  const { content } = useDb();
  const hydrated = useHydrated();
  // Forms copy their initial value, so wait for saved data before mounting them.
  if (!hydrated) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Site content"
        description="Edit the public site's copy. Changes go live as soon as you save."
      />
      <ContentSection
        title="WhatsApp community"
        description="Students see this after their payment is confirmed."
        value={content.community}
        fields={[
          {
            key: "whatsappUrl",
            label: "Community invite link",
            kind: "url",
            hint: "https://chat.whatsapp.com/…",
          },
          { key: "title", label: "Heading" },
          { key: "body", label: "Message", kind: "multiline" },
        ]}
        schema={communitySchema}
        onSave={(value) => settingsApi.saveContent("community", value)}
      />
      <ContentSection
        title="Hero"
        value={content.hero}
        fields={[
          { key: "eyebrow", label: "Label" },
          { key: "title", label: "Headline" },
          { key: "highlight", label: "Highlighted words", hint: "Shown in the brand gradient." },
          { key: "primaryCta", label: "Main button" },
          { key: "secondaryCta", label: "Second button" },
          { key: "subtitle", label: "Intro paragraph", kind: "multiline" },
        ]}
        schema={heroSchema}
        onSave={(value) => settingsApi.saveContent("hero", value)}
      />
      <ContentListSection
        title="Stats"
        itemLabel="Stat"
        items={content.stats}
        fields={[
          { key: "value", label: "Number" },
          { key: "label", label: "Label" },
        ]}
        createItem={() => ({ value: "", label: "" })}
        schema={statsSchema}
        onSave={(items) => settingsApi.saveContent("stats", items)}
      />
      <ContentListSection
        title="How it works"
        itemLabel="Step"
        items={content.steps}
        fields={[
          { key: "title", label: "Title" },
          { key: "body", label: "Text", kind: "multiline" },
        ]}
        createItem={() => ({ title: "", body: "" })}
        schema={stepsSchema}
        onSave={(items) => settingsApi.saveContent("steps", items)}
      />
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
        createItem={() => ({
          id: newId("tst"),
          name: "",
          role: "",
          quote: "",
          isPlaceholder: false,
        })}
        schema={testimonialsSchema}
        onSave={(items) => settingsApi.saveContent("testimonials", items)}
      />
      <ContentListSection
        title="FAQs"
        itemLabel="Question"
        items={content.faqs}
        fields={[
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer", kind: "multiline" },
        ]}
        createItem={() => ({ id: newId("faq"), question: "", answer: "" })}
        schema={faqsSchema}
        onSave={(items) => settingsApi.saveContent("faqs", items)}
      />
      <ContentSection
        title="Checkout messages"
        value={content.checkout}
        fields={[
          { key: "promoHelp", label: "Promo code help", kind: "multiline" },
          { key: "receiptHelp", label: "Receipt upload help", kind: "multiline" },
          { key: "pendingMessage", label: "After submitting", kind: "multiline" },
        ]}
        schema={checkoutContentSchema}
        onSave={(value) => settingsApi.saveContent("checkout", value)}
      />
      <ContentSection
        title="Contact"
        value={content.contact}
        fields={[
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "whatsapp", label: "WhatsApp" },
          { key: "address", label: "Address" },
        ]}
        schema={contactContentSchema}
        onSave={(value) => settingsApi.saveContent("contact", value)}
      />
      <ContentSection
        title="Footer"
        value={content.footer}
        fields={[{ key: "blurb", label: "About text", kind: "multiline" }]}
        schema={footerSchema}
        onSave={(value) => settingsApi.saveContent("footer", value)}
      />
    </>
  );
}

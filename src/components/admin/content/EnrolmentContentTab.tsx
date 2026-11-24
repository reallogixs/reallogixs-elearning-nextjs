"use client";

import type { ReactElement } from "react";

import type { SiteContent } from "@/types/domain";
import { settingsApi } from "@/lib/api";
import { checkoutContentSchema, communitySchema } from "@/lib/validation/content";

import { ContentSection } from "./ContentSection";

/** Checkout help text and the WhatsApp community message shown after confirmation. */
export function EnrolmentContentTab({ content }: { content: SiteContent }): ReactElement {
  return (
    <>
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
    </>
  );
}

"use client";

import type { ReactElement } from "react";

import type { SiteContent } from "@/types/domain";
import { settingsApi } from "@/lib/api";
import { contactContentSchema, footerSchema } from "@/lib/validation/content";

import { ContentSection } from "./ContentSection";

/** Footer copy and the contact details used across the site. */
export function FooterContentTab({ content }: { content: SiteContent }): ReactElement {
  return (
    <>
      <ContentSection
        title="Footer"
        description="Shown at the bottom of every public page."
        value={content.footer}
        fields={[
          { key: "headline", label: "Big headline" },
          {
            key: "highlight",
            label: "Highlighted words",
            hint: "Shown after the headline in the brand gradient.",
            optional: true,
          },
          { key: "ctaLabel", label: "Button" },
          { key: "tagline", label: "Bottom line", hint: "Links to reallogixs.com.au." },
          { key: "blurb", label: "About text", kind: "multiline" },
        ]}
        schema={footerSchema}
        onSave={(value) => settingsApi.saveContent("footer", value)}
      />
      <ContentSection
        title="Contact details"
        description="Used in the footer, the mobile menu and order messages."
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
    </>
  );
}

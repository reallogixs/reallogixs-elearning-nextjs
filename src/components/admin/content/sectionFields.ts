import type { AuthPageCopy, PageCopy, SectionCopy } from "@/types/domain";

import type { ContentField } from "./fieldTypes";

/** Shared field lists so every section/page editor looks the same. */
export const SECTION_FIELDS: ContentField<SectionCopy>[] = [
  { key: "label", label: "Small label", hint: "Shown above the heading, e.g. FEATURED COURSES." },
  { key: "title", label: "Heading" },
  {
    key: "highlight",
    label: "Highlighted words",
    hint: "Shown after the heading in the brand gradient.",
    optional: true,
  },
  { key: "description", label: "Intro line", kind: "multiline", optional: true },
];

export const PAGE_FIELDS: ContentField<PageCopy>[] = [
  { key: "label", label: "Small label" },
  { key: "title", label: "Heading" },
  { key: "body", label: "Intro", kind: "multiline" },
];

export const AUTH_PAGE_FIELDS: ContentField<AuthPageCopy>[] = [
  ...(PAGE_FIELDS as ContentField<AuthPageCopy>[]),
  { key: "asideTitle", label: "Side panel heading" },
  { key: "asideBody", label: "Side panel text", kind: "multiline" },
];

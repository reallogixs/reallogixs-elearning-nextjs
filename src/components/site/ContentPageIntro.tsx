"use client";

import type { ReactElement } from "react";

import type { SiteContent } from "@/types/domain";

import { PageIntro } from "./PageIntro";
import { useContent } from "@/components/data/SiteData";

/** Page intro whose copy is managed in Admin → Site content → Pages. */
export function ContentPageIntro({ page }: { page: "courses" | "track" | "verify" }): ReactElement {
  const copy: SiteContent["pages"][typeof page] = useContent().pages[page];
  return <PageIntro label={copy.label} title={copy.title} body={copy.body} />;
}

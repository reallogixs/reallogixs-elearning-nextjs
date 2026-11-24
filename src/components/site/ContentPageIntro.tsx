"use client";

import type { ReactElement } from "react";

import type { SiteContent } from "@/types/domain";
import { useDb } from "@/lib/store/hooks";

import { PageIntro } from "./PageIntro";

/** Page intro whose copy is managed in Admin → Site content → Pages. */
export function ContentPageIntro({ page }: { page: "courses" | "track" | "verify" }): ReactElement {
  const copy: SiteContent["pages"][typeof page] = useDb().content.pages[page];
  return <PageIntro label={copy.label} title={copy.title} body={copy.body} />;
}

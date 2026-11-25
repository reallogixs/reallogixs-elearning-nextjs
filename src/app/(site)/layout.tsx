import type { ReactElement, ReactNode } from "react";

import { getPublicCatalogue } from "@/server/queries/catalogue";
import { getContent } from "@/server/queries/content";
import { SiteDataProvider } from "@/components/data/SiteData";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/** Rendered per request from cached data, so building the site needs no database. */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const [content, catalogue] = await Promise.all([getContent(), getPublicCatalogue()]);
  return (
    <SiteDataProvider content={content} catalogue={catalogue}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-pill focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </SiteDataProvider>
  );
}

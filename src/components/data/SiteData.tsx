"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";

import type { Catalogue } from "@/types/catalogue";
import type { SiteContent } from "@/types/domain";

interface SiteData {
  content: SiteContent;
  catalogue: Catalogue;
}

const Context = createContext<SiteData | null>(null);

/** Public site data, loaded by the server layout and part of the first render. */
export function SiteDataProvider({
  content,
  catalogue,
  children,
}: SiteData & { children: ReactNode }): ReactElement {
  return <Context value={{ content, catalogue }}>{children}</Context>;
}

function useSiteData(): SiteData {
  const data = useContext(Context);
  if (!data) throw new Error("Site data is only available on public pages.");
  return data;
}

export function useContent(): SiteContent {
  return useSiteData().content;
}

export function useCatalogue(): Catalogue {
  return useSiteData().catalogue;
}

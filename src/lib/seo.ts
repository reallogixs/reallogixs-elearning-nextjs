import type { Metadata } from "next";

export const SITE = {
  name: "Reallogixs Academy",
  url: "https://academy.reallogixs.com",
  description:
    "Live, mentor-led courses in software, AI, design and marketing from Reallogixs. Learn online or on campus in Lahore and pay with JazzCash, Easypaisa, SadaPay, NayaPay or bank transfer.",
} as const;

interface MetaInput {
  title: string;
  description?: string;
  path?: string;
  /** Portals and checkout are private: keep them out of search. */
  noIndex?: boolean;
}

export function buildMetadata({ title, description, path = "/", noIndex }: MetaInput): Metadata {
  return {
    title,
    description: description ?? SITE.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description: description ?? SITE.description,
      url: path,
      siteName: SITE.name,
      locale: "en_PK",
      type: "website",
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

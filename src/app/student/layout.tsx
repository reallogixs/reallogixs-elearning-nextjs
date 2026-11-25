import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";

import { PortalDataProvider } from "@/components/data/PortalData";
import { SiteDataProvider } from "@/components/data/SiteData";
import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortal } from "@/server/core/page";
import { getPublicCatalogue } from "@/server/queries/catalogue";
import { getContent } from "@/server/queries/content";
import { studentData } from "@/server/queries/orders";

export const metadata: Metadata = {
  title: "Student portal",
  robots: { index: false, follow: false },
};

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const account = await requirePortal("student");
  const [content, catalogue] = await Promise.all([getContent(), getPublicCatalogue()]);
  return (
    <SiteDataProvider content={content} catalogue={catalogue}>
      <PortalShell account={account}>
        <PortalDataProvider data={studentData(account)}>{children}</PortalDataProvider>
      </PortalShell>
    </SiteDataProvider>
  );
}

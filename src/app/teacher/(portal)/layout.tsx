import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";

import { PortalDataProvider } from "@/components/data/PortalData";
import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortal } from "@/server/core/page";
import { teacherData } from "@/server/queries/orders";

export const metadata: Metadata = {
  title: "Teacher portal",
  robots: { index: false, follow: false },
};

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const account = await requirePortal("teacher");
  return (
    <PortalShell account={account}>
      <PortalDataProvider data={teacherData(account.id)}>{children}</PortalDataProvider>
    </PortalShell>
  );
}

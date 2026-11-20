import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Student portal",
  robots: { index: false, follow: false },
};

export default function StudentLayout({ children }: { children: ReactNode }): ReactElement {
  return <PortalShell role="student">{children}</PortalShell>;
}

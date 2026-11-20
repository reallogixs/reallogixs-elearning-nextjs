import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Teacher portal",
  robots: { index: false, follow: false },
};

export default function TeacherLayout({ children }: { children: ReactNode }): ReactElement {
  return <PortalShell role="teacher">{children}</PortalShell>;
}

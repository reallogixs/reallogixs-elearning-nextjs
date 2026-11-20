import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Admin portal",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }): ReactElement {
  return <PortalShell role="admin">{children}</PortalShell>;
}

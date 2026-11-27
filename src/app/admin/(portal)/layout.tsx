import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";

import { PortalDataProvider } from "@/components/data/PortalData";
import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortal } from "@/server/core/page";
import { adminNotices } from "@/server/queries/notifications";
import { adminData } from "@/server/queries/orders";

export const metadata: Metadata = {
  title: "Admin portal",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const account = await requirePortal("admin");
  // Not awaited: the menu shows straight away and the data follows.
  const data = adminData();
  const pending = data.then(
    ({ orders }) => orders.filter((order) => order.status === "pending").length,
  );
  const notices = adminNotices().then((list) => list.length);
  // The page shows the error; the badges just stay empty.
  pending.catch(() => undefined);
  notices.catch(() => undefined);
  return (
    <PortalShell account={account} pending={pending} notices={notices}>
      <PortalDataProvider data={data}>{children}</PortalDataProvider>
    </PortalShell>
  );
}

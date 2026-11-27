import type { ReactElement } from "react";

import { AccountSettings } from "@/components/account/AccountSettings";
import { requirePortal } from "@/server/core/page";

export default async function AdminSettingsPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <AccountSettings />;
}

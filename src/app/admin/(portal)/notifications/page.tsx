import type { ReactElement } from "react";

import { NotificationsAdmin } from "@/components/admin/NotificationsAdmin";
import { requirePortal } from "@/server/core/page";
import { adminNotices } from "@/server/queries/notifications";

export default async function AdminNotificationsPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <NotificationsAdmin notices={await adminNotices()} />;
}

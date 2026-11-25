import type { ReactElement } from "react";

import { SiteContentEditor } from "@/components/admin/content/SiteContentEditor";
import { requirePortal } from "@/server/core/page";
import { getContent } from "@/server/queries/content";

export default async function AdminContentPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <SiteContentEditor content={await getContent()} />;
}

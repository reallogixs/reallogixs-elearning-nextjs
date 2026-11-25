import type { ReactElement } from "react";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { requirePortal } from "@/server/core/page";
import { getCatalogue } from "@/server/queries/catalogue";

export default async function AdminCategoriesPage(): Promise<ReactElement> {
  await requirePortal("admin");
  const { categories, courses } = await getCatalogue();
  return <CategoryManager categories={categories} courses={courses} />;
}

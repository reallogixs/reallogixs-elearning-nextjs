import type { ReactElement } from "react";

import { NotFoundState } from "@/components/ui/NotFoundState";

export default function SiteNotFound(): ReactElement {
  return (
    <NotFoundState
      title="Not found"
      body="This page or course may have been removed."
      href="/courses"
      cta="See all courses"
    />
  );
}

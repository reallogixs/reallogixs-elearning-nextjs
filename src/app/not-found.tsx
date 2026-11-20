import type { ReactElement } from "react";

import { NotFoundState } from "@/components/ui/NotFoundState";

export default function NotFound(): ReactElement {
  return (
    <main id="main">
      <NotFoundState
        title="Page not found"
        body="The page you're looking for doesn't exist or has moved."
        href="/"
        cta="Back to the academy"
      />
    </main>
  );
}

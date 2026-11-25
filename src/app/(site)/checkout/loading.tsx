import type { ReactElement } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutLoading(): ReactElement {
  return (
    <div role="status">
      <span className="sr-only">Loading…</span>
      <Skeleton className="shell my-16 h-[32rem]" />
    </div>
  );
}

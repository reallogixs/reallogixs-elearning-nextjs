import { Suspense, type ReactElement } from "react";

import { AllOrders } from "@/components/admin/AllOrders";

export default function AdminOrdersPage(): ReactElement {
  return (
    <Suspense>
      <AllOrders />
    </Suspense>
  );
}

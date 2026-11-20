import { Suspense, type ReactElement } from "react";

import { PaymentsQueue } from "@/components/admin/PaymentsQueue";

export default function AdminPaymentsPage(): ReactElement {
  return (
    <Suspense>
      <PaymentsQueue />
    </Suspense>
  );
}

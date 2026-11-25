import type { ReactElement } from "react";

import { PaymentMethodsAdmin } from "@/components/admin/payments/PaymentMethodsAdmin";
import { requirePortal } from "@/server/core/page";
import { listPaymentMethods } from "@/server/queries/payments";

export default async function AdminPaymentMethodsPage(): Promise<ReactElement> {
  await requirePortal("admin");
  return <PaymentMethodsAdmin methods={await listPaymentMethods({ enabledOnly: false })} />;
}

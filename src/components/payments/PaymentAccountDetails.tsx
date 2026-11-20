import type { ReactElement } from "react";

import type { PaymentMethod } from "@/types/domain";
import { formatPKR } from "@/lib/domain/format";
import { CopyButton } from "@/components/ui/CopyButton";

import { PaymentMethodLogo } from "./PaymentMethodLogo";

/** Where to send the money: the amount plus every detail row the admin configured. */
export function PaymentAccountDetails({
  method,
  amount,
}: {
  method: PaymentMethod;
  amount: number;
}): ReactElement {
  const rows = [
    { id: "amount", label: "Amount", value: formatPKR(amount), copy: String(amount) },
    ...method.fields.map((field) => ({
      ...field,
      copy: field.copyable ? field.value.replace(/\s/g, "") : undefined,
    })),
  ];

  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-mist p-5">
      <div className="flex items-center gap-3">
        <PaymentMethodLogo name={method.name} logoUrl={method.logoUrl} />
        <p className="font-display text-h4">Pay with {method.name}</p>
      </div>
      <dl className="flex flex-col divide-y divide-line">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-x-4 py-2">
            <dt className="text-small text-ink-soft">{row.label}</dt>
            <dd className="flex items-center gap-1 font-mono text-small font-medium break-all">
              {row.value}
              {row.copy ? <CopyButton value={row.copy} className="-my-2" /> : null}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-small text-ink-soft">{method.instructions}</p>
    </div>
  );
}

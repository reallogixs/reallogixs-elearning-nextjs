import type { ReactElement } from "react";

import type { Order, PaymentMethod, User } from "@/types/domain";
import { formatDateTime, formatPKR } from "@/lib/domain/format";

interface OrderFactsProps {
  order: Order;
  method?: PaymentMethod;
  teacher?: User;
}

/** What the admin compares against the receipt. */
export function OrderFacts({ order, method, teacher }: OrderFactsProps): ReactElement {
  const rows: [string, string][] = [
    ["Method", method?.name ?? "—"],
    ["Promo code", order.promoCode ? `${order.promoCode} (${teacher?.name ?? "teacher"})` : "None"],
    ...(order.price.discount > 0
      ? ([["Discount", `−${formatPKR(order.price.discount)}`]] as [string, string][])
      : []),
    ["Email", order.contact.email],
    ["Phone", order.contact.phone],
    ["Account", order.studentId ? "Registered" : "Guest"],
    ["Placed", formatDateTime(order.createdAt)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 text-small">
      <dt className="text-ink-soft">Amount due</dt>
      <dd className="font-display text-h4 font-semibold">{formatPKR(order.price.total)}</dd>
      {rows.map(([term, detail]) => (
        <div key={term} className="contents">
          <dt className="text-ink-soft">{term}</dt>
          <dd className="break-all">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

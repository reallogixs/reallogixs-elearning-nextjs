import type { ReactElement } from "react";
import { ChevronDown } from "lucide-react";

import type { CatalogueCourse } from "@/types/catalogue";
import type { PriceBreakdown } from "@/types/domain";
import { formatPKR } from "@/lib/domain/format";

import { PriceSummary } from "./PriceSummary";

interface MobileOrderSummaryProps {
  course: CatalogueCourse;
  price: PriceBreakdown;
  promoCode: string | null;
}

/** Phones and tablets: the total stays in view above the form; tap for the breakdown. */
export function MobileOrderSummary(props: MobileOrderSummaryProps): ReactElement {
  return (
    <details className="group rounded-md border border-line bg-mist lg:hidden">
      <summary className="flex min-h-14 items-center justify-between gap-3 px-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-small font-medium">
          Order summary
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
        </span>
        <span className="font-display text-h4 font-semibold">{formatPKR(props.price.total)}</span>
      </summary>
      <div className="p-2 pt-0">
        <PriceSummary {...props} />
      </div>
    </details>
  );
}

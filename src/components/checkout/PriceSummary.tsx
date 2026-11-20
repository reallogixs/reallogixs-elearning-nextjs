import type { ReactElement } from "react";

import type { Course, PriceBreakdown } from "@/types/domain";
import { formatDate, formatPKR } from "@/lib/domain/format";
import { MODE_LABEL } from "@/components/courses/courseLabels";

interface PriceSummaryProps {
  course: Course;
  price: PriceBreakdown;
  promoCode: string | null;
}

export function PriceSummary({ course, price, promoCode }: PriceSummaryProps): ReactElement {
  return (
    <div className="flex flex-col gap-5 rounded-lg bg-navy-900 p-6 text-on-dark">
      <p className="font-mono text-label text-on-dark-soft uppercase">Order summary</p>
      <div>
        <p className="font-display text-h4 text-white">{course.title}</p>
        <p className="mt-1 text-small text-on-dark-soft">
          {MODE_LABEL[course.mode]} · Starts {formatDate(course.startDate)}
        </p>
      </div>
      <dl className="flex flex-col gap-2 border-t border-line-dark pt-4 text-small">
        <div className="flex justify-between">
          <dt>Course fee</dt>
          <dd>{formatPKR(price.base)}</dd>
        </div>
        {price.discount > 0 ? (
          <div className="flex justify-between text-sky-300">
            <dt>
              Code {promoCode} ({price.discountPct}% off)
            </dt>
            <dd>−{formatPKR(price.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-line-dark pt-3 font-display text-h4 text-white">
          <dt>Total</dt>
          <dd>{formatPKR(price.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

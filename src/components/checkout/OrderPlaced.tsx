"use client";

import type { ReactElement, RefObject } from "react";
import Link from "next/link";

import type { OrderResult } from "@/types/portal";
import { PortalDataProvider } from "@/components/data/PortalData";
import { OrderStatusPanel } from "@/components/orders/OrderStatusPanel";
import { Button } from "@/components/ui/Button";

interface OrderPlacedProps {
  result: OrderResult;
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Signed in, or just signed up at checkout. */
  hasAccount: boolean;
}

export function OrderPlaced({ result, headingRef, hasAccount }: OrderPlacedProps): ReactElement {
  return (
    <div className="shell flex max-w-3xl flex-col gap-6 py-12 lg:py-16">
      <h1 ref={headingRef} tabIndex={-1} className="text-h2 outline-none">
        Receipt received. Save your order number.
      </h1>
      <p className="text-ink-soft">
        Use it with your phone number on the{" "}
        <Link href="/track" className="text-teal-700 underline">
          Track enrolment
        </Link>{" "}
        page.
        {hasAccount
          ? " It's also in your student portal."
          : " Create an account any time to keep all your courses in one place."}
      </p>
      <PortalDataProvider data={result.data}>
        <OrderStatusPanel orderId={result.number} />
      </PortalDataProvider>
      {!hasAccount ? (
        <div>
          <Button href="/signup" variant="secondary" size="sm">
            Create a student account (optional)
          </Button>
        </div>
      ) : null}
    </div>
  );
}

import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/site/PageIntro";
import { OrderLookup } from "@/components/orders/OrderLookup";

export const metadata = buildMetadata({
  title: "Track enrolment",
  description:
    "Check your Reallogixs Academy enrolment status with your order number and phone. Upload a new receipt or get your WhatsApp community link once confirmed.",
  path: "/track",
});

export default function TrackPage(): ReactElement {
  return (
    <>
      <PageIntro
        label="Track enrolment"
        title="Where's my enrolment?"
        body="Enter the order number from checkout and the phone number you used. Demo: try RLX-9GUEST with 0344 1112233."
      />
      <section className="shell max-w-4xl pt-10 pb-section lg:pt-12">
        <Suspense>
          <OrderLookup />
        </Suspense>
      </section>
    </>
  );
}

import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { ContentPageIntro } from "@/components/site/ContentPageIntro";
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
      <ContentPageIntro page="track" />
      <section className="shell max-w-4xl pt-10 pb-section lg:pt-12">
        <Suspense>
          <OrderLookup />
        </Suspense>
      </section>
    </>
  );
}

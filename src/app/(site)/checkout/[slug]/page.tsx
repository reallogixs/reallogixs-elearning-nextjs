import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata = buildMetadata({ title: "Enrol", path: "/checkout", noIndex: true });

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;
  return <CheckoutFlow slug={slug} />;
}

import type { ReactElement } from "react";
import { notFound } from "next/navigation";

import { buildMetadata } from "@/lib/seo";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getPublicCatalogue } from "@/server/queries/catalogue";
import { listPaymentMethods } from "@/server/queries/payments";

export const metadata = buildMetadata({ title: "Enrol", path: "/checkout", noIndex: true });

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;
  const { courses } = await getPublicCatalogue();
  const course = courses.find((item) => item.slug === slug) ?? notFound();
  const methods = await listPaymentMethods({ enabledOnly: true });
  return <CheckoutFlow course={course} methods={methods} />;
}

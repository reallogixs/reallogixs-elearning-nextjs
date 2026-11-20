import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { CertificateView } from "@/components/certificates/CertificateView";

export const metadata = buildMetadata({
  title: "Certificate",
  path: "/certificates",
  noIndex: true,
});

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<ReactElement> {
  const { code } = await params;
  return (
    <main id="main">
      <CertificateView code={code} />
    </main>
  );
}

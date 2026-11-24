import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { VerifyCertificate } from "@/components/certificates/VerifyCertificate";
import { ContentPageIntro } from "@/components/site/ContentPageIntro";

export const metadata = buildMetadata({
  title: "Verify a certificate",
  description:
    "Check that a Reallogixs Academy e-certificate is genuine. Enter the code printed on it to see who it was issued to, for which class and on what date.",
  path: "/verify",
});

export default function VerifyPage(): ReactElement {
  return (
    <>
      <ContentPageIntro page="verify" />
      <section className="shell max-w-4xl pt-10 pb-section lg:pt-12">
        <Suspense>
          <VerifyCertificate />
        </Suspense>
      </section>
    </>
  );
}

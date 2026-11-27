import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { CertificateView } from "@/components/certificates/CertificateView";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { layoutCertificateText } from "@/server/files/certificateFonts";
import { findCertificate } from "@/server/queries/classes";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({
  title: "Certificate",
  path: "/certificates",
  noIndex: true,
});

/** The printable certificate; its address doubles as the public verification link. */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<ReactElement> {
  const { code } = await params;
  const certificate = await findCertificate(code);
  return (
    <main id="main">
      {certificate && !certificate.revokedAt ? (
        <CertificateView
          certificate={certificate}
          text={await layoutCertificateText(certificate.studentName, certificate.courseTitle)}
        />
      ) : (
        <NotFoundState
          title={certificate ? "Certificate revoked" : "Certificate not found"}
          body={
            certificate
              ? "Reallogixs issued this certificate, but it is no longer valid."
              : "Check the verification code and try again."
          }
          href="/verify"
          cta={certificate ? "Verify another" : "Verify a code"}
        />
      )}
    </main>
  );
}

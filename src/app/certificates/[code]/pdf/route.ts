import { certificatePdf } from "@/server/files/certificatePdf";
import { findCertificate } from "@/server/queries/classes";

/** The certificate as a file. Goes back to the page if there is none to give. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const { code } = await params;
  const certificate = await findCertificate(code);
  const pdf = certificate && !certificate.revokedAt ? await certificatePdf(certificate) : null;
  if (!certificate || !pdf)
    return new Response(null, {
      status: 303,
      headers: { Location: `/certificates/${encodeURIComponent(code)}` },
    });
  return new Response(Uint8Array.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificate.code}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

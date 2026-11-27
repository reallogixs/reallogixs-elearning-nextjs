import { sniffType } from "@/server/files/sniff";
import { readLocal } from "@/server/files/storage";

/** Logos and banners saved without Cloudinary, in development only. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; name: string }> },
): Promise<Response> {
  const { kind, name } = await params;
  const allowed =
    process.env.NODE_ENV !== "production" &&
    (kind === "logos" || kind === "banners") &&
    /^[0-9a-f-]{36}$/.test(name);
  const data = allowed ? await readLocal(kind, name) : null;
  if (!data) return new Response(null, { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": sniffType(data) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}

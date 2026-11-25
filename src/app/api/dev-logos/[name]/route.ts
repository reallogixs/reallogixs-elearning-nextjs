import { sniffType } from "@/server/files/sniff";
import { readLocal } from "@/server/files/storage";

/** Logos saved without Cloudinary, in development only. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name } = await params;
  const data =
    process.env.NODE_ENV === "production" || !/^[0-9a-f-]{36}$/.test(name)
      ? null
      : await readLocal("logos", name);
  if (!data) return new Response(null, { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": sniffType(data) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}

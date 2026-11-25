import { mockReceiptUrl } from "@/mocks/receipts";
import { uuidSchema } from "@/lib/validation/shared";
import { currentUser } from "@/server/core/session";
import { db } from "@/server/db";
import { readReceipt } from "@/server/files/storage";

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Content-Disposition": "inline",
};

const missing = (): Response => new Response(null, { status: 404, headers: HEADERS });

/** The only way to see a receipt: admins, and the student it belongs to. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const user = await currentUser();
  if (!user || !(await uuidSchema.required().isValid(id))) return missing();
  const receipt = await db().receipt.findUnique({
    where: { id },
    include: { order: { select: { studentId: true, total: true } } },
  });
  const allowed = user.role === "admin" || receipt?.order.studentId === user.id;
  if (!receipt || !allowed) return missing();

  // Seeded development orders have no file, so their receipt is drawn.
  if (receipt.publicId.startsWith("demo/")) {
    const drawn = mockReceiptUrl("Receipt", receipt.order.total, receipt.transactionRef);
    return new Response(decodeURIComponent(drawn.slice(drawn.indexOf(",") + 1)), {
      headers: {
        ...HEADERS,
        "Content-Type": "image/svg+xml",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  }
  const data = await readReceipt(receipt.publicId);
  if (!data) return missing();
  return new Response(data, { headers: { ...HEADERS, "Content-Type": receipt.mimeType } });
}

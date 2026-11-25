// PLACEHOLDER: generated demo history so dashboards and charts have realistic data.
// Deterministic (seeded PRNG), so every reset produces the same orders.
import type { Order, OrderStatus } from "@/types/domain";

import { mockReceiptUrl } from "./receipts";

const FIRST = [
  "Ahmed",
  "Fatima",
  "Bilal",
  "Ayesha",
  "Hassan",
  "Sara",
  "Usman",
  "Maryam",
  "Danish",
  "Iqra",
  "Hamza",
  "Noor",
  "Saad",
  "Hira",
  "Taha",
  "Amna",
  "Zain",
  "Laiba",
];
const LAST = [
  "Khan",
  "Malik",
  "Qureshi",
  "Butt",
  "Sheikh",
  "Chaudhry",
  "Iqbal",
  "Raza",
  "Siddiqui",
  "Akhtar",
  "Mirza",
  "Abbasi",
];

const COURSES = [
  { id: "crs_genai", price: 38000 },
  { id: "crs_nextjs", price: 45000 },
  { id: "crs_uiux", price: 22000 },
  { id: "crs_node", price: 32000 },
  { id: "crs_ml", price: 35000 },
  { id: "crs_flutter", price: 40000 },
];

const METHODS = [
  { id: "pm_jazzcash", name: "JazzCash" },
  { id: "pm_easypaisa", name: "Easypaisa" },
  { id: "pm_sadapay", name: "SadaPay" },
  { id: "pm_nayapay", name: "NayaPay" },
  { id: "pm_bank", name: "Bank" },
];

const TEACHERS = [
  { id: "usr_t_sana", code: "SANA-K7Q", commissionPct: 15, discountPct: 10 },
  { id: "usr_t_usman", code: "USMAN-3PX", commissionPct: 10, discountPct: 5 },
];

/** mulberry32: tiny seeded PRNG. */
function prng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length)] as T;
}

/** ~40 guest orders spread over the 12 weeks before `end`, trending upwards. */
export function generateHistory(end: Date, count = 40): Order[] {
  const random = prng(20261120);
  const orders: Order[] = [];
  for (let index = 0; index < count; index += 1) {
    // Square-root skew puts more orders in recent weeks (growth).
    const daysAgo = Math.floor((1 - Math.sqrt(random())) * 84) + 2;
    const created = new Date(
      end.getTime() - daysAgo * 86_400_000 - Math.floor(random() * 36_000_000),
    );
    const course = pick(COURSES, random);
    const method = pick(METHODS, random);
    const teacher = random() < 0.55 ? pick(TEACHERS, random) : null;
    const discount = teacher ? Math.round((course.price * teacher.discountPct) / 100) : 0;
    const total = course.price - discount;
    const roll = random();
    const status: OrderStatus =
      daysAgo < 4 && roll < 0.5
        ? "pending"
        : roll < 0.06
          ? "cancelled"
          : roll < 0.12
            ? "rejected"
            : "confirmed";
    const first = pick(FIRST, random);
    const last = pick(LAST, random);
    const id = `RLX-DH${String(index).padStart(2, "0")}${"ABCDEFGHJK"[index % 10]}`;
    const ref = `${method.name.slice(0, 2).toUpperCase()}${Math.floor(random() * 9e6 + 1e6)}`;
    const createdIso = created.toISOString();
    const decidedIso = new Date(created.getTime() + 5 * 3_600_000).toISOString();
    orders.push({
      id,
      courseId: course.id,
      studentId: null,
      contact: {
        name: `${first} ${last}`,
        email: `${first}.${last}${index}@example.com`.toLowerCase(),
        phone: `03${String(10 + (index % 40)).padStart(2, "0")} ${String(1000000 + index * 7919).slice(0, 7)}`,
      },
      promoCode: teacher?.code ?? null,
      price: { base: course.price, discountPct: teacher?.discountPct ?? 0, discount, total },
      commission: teacher
        ? {
            teacherId: teacher.id,
            pct: teacher.commissionPct,
            amount: Math.round((total * teacher.commissionPct) / 100),
            payoutId: null,
          }
        : null,
      paymentMethodId: method.id,
      receipts: [
        {
          id: `rcp_h${index}`,
          fileName: `${ref}.png`,
          mimeType: "image/svg+xml",
          url: mockReceiptUrl(method.name, total, ref),
          transactionRef: ref,
          uploadedAt: createdIso,
        },
      ],
      status,
      rejectionReason:
        status === "rejected"
          ? "The screenshot is cropped and the amount isn't visible. Please upload the full receipt."
          : null,
      history: [
        { at: createdIso, status: "pending" },
        ...(status === "pending" ? [] : [{ at: decidedIso, status }]),
      ],
      createdAt: createdIso,
      updatedAt: status === "pending" ? createdIso : decidedIso,
    });
  }
  return orders;
}

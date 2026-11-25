import type { Tx } from "@/server/db";

/** Makes changes to a course's seats wait for each other, so the last seat sells once. */
export async function lockCourse(tx: Tx, courseId: string): Promise<void> {
  await tx.$queryRaw`SELECT id FROM courses WHERE id = ${courseId}::uuid FOR UPDATE`;
}

/** Starting, ending and completing a class wait for each other and for students coming in. */
export async function lockMeeting(tx: Tx, courseId: string): Promise<void> {
  await tx.$queryRaw`SELECT id FROM meetings WHERE course_id = ${courseId}::uuid FOR UPDATE`;
}

/** Keeps the class's status steady while a student is let in. Others can come in meanwhile. */
export async function holdMeeting(tx: Tx, courseId: string): Promise<void> {
  await tx.$queryRaw`SELECT id FROM meetings WHERE course_id = ${courseId}::uuid FOR SHARE`;
}

/** Makes changes to one order wait for each other. */
export async function lockOrder(tx: Tx, number: string): Promise<void> {
  await tx.$queryRaw`SELECT id FROM orders WHERE number = ${number} FOR UPDATE`;
}

/** A teacher's commissions ready to pay, held until the payout is recorded. */
export async function lockDueCommissions(
  tx: Tx,
  teacherId: string,
): Promise<{ order_id: string; amount: number }[]> {
  return tx.$queryRaw<{ order_id: string; amount: number }[]>`
    SELECT c.order_id, c.amount FROM orders o JOIN commissions c ON c.order_id = o.id
    WHERE c.teacher_id = ${teacherId}::uuid AND c.payout_id IS NULL AND o.status = 'confirmed'
    FOR UPDATE`;
}

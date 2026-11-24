// PLACEHOLDER: demo Zoom meetings. Ids and links are derived from record ids so every
// reset (and the server render) produces the same data.
import type { Course, Meeting, Order } from "@/types/domain";
import { emptyMeeting } from "@/lib/domain/meeting";

function hash(value: string, seed: number): number {
  let result = seed;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619) >>> 0;
  return result;
}

function demoZoomId(courseId: string): string {
  return `8${String(hash(courseId, 2166136261)).padStart(10, "0").slice(0, 10)}`;
}

function demoToken(orderId: string): string {
  return [1, 2, 3]
    .map((seed) =>
      hash(orderId, seed * 7919)
        .toString(36)
        .padStart(7, "0"),
    )
    .join("");
}

/** A scheduled meeting with every confirmed student of the course registered. */
export function demoMeeting(course: Course, orders: Order[]): Meeting {
  return {
    ...emptyMeeting(course.id, demoZoomId(course.id)),
    registrants: orders
      .filter((order) => order.courseId === course.id && order.status === "confirmed")
      .map((order) => ({
        orderId: order.id,
        name: order.contact.name,
        email: order.contact.email,
        joinToken: demoToken(order.id),
        registeredAt: order.updatedAt,
      })),
  };
}

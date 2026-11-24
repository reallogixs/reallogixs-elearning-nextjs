import type { Course } from "@/types/domain";
import { newJoinToken, newZoomId } from "@/lib/domain/ids";

/**
 * MOCK ZOOM. Same calls the real Zoom REST API needs, so only this file changes later:
 *
 * - createMeeting      POST   /users/me/meetings with `approval_type: 1` (registration with
 *                             approval), `meeting_authentication: true` (signed-in users
 *                             only), `join_before_host: false`, `allow_multiple_devices: false`
 * - updateMeeting      PATCH  /meetings/{id}
 * - deleteMeeting      DELETE /meetings/{id}
 * - addRegistrant      POST   /meetings/{id}/registrants, then approve; returns the join_url
 * - removeRegistrant   PUT    /meetings/{id}/registrants/status (cancel)
 *
 * Attendance comes from the meeting.started / ended / participant_joined / _left webhooks.
 * Needs a paid Zoom plan and Server-to-Server OAuth, called from the server only.
 */
export async function createMeeting(): Promise<{ zoomId: string }> {
  return { zoomId: newZoomId() };
}

export async function updateMeeting(zoomId: string, course: Pick<Course, "title">): Promise<void> {
  void [zoomId, course];
}

export async function deleteMeeting(zoomId: string): Promise<void> {
  void zoomId;
}

export async function addRegistrant(
  zoomId: string,
  person: { name: string; email: string },
): Promise<{ joinToken: string }> {
  void [zoomId, person];
  return { joinToken: newJoinToken() };
}

export async function removeRegistrant(zoomId: string, email: string): Promise<void> {
  void [zoomId, email];
}

/** 812 3456 7890 */
export function formatZoomId(zoomId: string): string {
  return zoomId.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
}

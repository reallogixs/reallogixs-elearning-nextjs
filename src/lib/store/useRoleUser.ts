"use client";

import type { StudentUser, TeacherUser } from "@/types/domain";

import { useCurrentUser } from "./hooks";

/** Inside a portal (behind RequireRole) the user is known to have this role. */
export function useStudent(): StudentUser | null {
  const user = useCurrentUser();
  return user?.role === "student" ? user : null;
}

export function useTeacher(): TeacherUser | null {
  const user = useCurrentUser();
  return user?.role === "teacher" ? user : null;
}

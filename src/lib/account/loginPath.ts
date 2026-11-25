import type { Role } from "@/types/domain";

/** Each role has its own login. Only the student one is linked from the public site. */
export const LOGIN_PATH: Record<Role, string> = {
  student: "/login",
  teacher: "/teacher/login",
  admin: "/admin/login",
};

/** Where to go after signing in: only same-site paths, and for staff only inside their portal. */
export function safeNext(role: Role, next: string | undefined): string | null {
  // "//" and "/\" would send the browser to another site.
  if (!next || !/^\/(?![/\\])/.test(next)) return null;
  if (role === "student") return next;
  return next === `/${role}` || next.startsWith(`/${role}/`) ? next : null;
}

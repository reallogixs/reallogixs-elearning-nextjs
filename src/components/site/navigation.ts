export interface NavItem {
  href: string;
  label: string;
}

export const SITE_NAV: NavItem[] = [
  { href: "/courses", label: "Courses" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/track", label: "Track enrolment" },
  { href: "/#faq", label: "FAQ" },
];

export const PORTAL_HOME: Record<"admin" | "teacher" | "student", string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

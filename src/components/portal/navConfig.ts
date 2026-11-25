import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  Mail,
  PanelsTopLeft,
  ReceiptText,
  Settings,
  ShoppingBag,
  UserRoundCog,
  Users,
  Video,
  Wallet,
  WalletCards,
} from "lucide-react";

import type { Role } from "@/types/domain";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows a count badge (e.g. receipts awaiting verification). */
  badge?: "pendingPayments";
}

export interface PortalNavGroup {
  /** Omit for the first, unlabelled group. */
  title?: string;
  items: PortalNavItem[];
}

export const PORTAL_NAV: Record<Role, PortalNavGroup[]> = {
  admin: [
    {
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/admin/payments",
          label: "Verify payments",
          icon: ReceiptText,
          badge: "pendingPayments",
        },
        { href: "/admin/orders", label: "All orders", icon: ShoppingBag },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { href: "/admin/courses", label: "Courses", icon: BookOpen },
        { href: "/admin/classes", label: "Classes", icon: Video },
        { href: "/admin/categories", label: "Categories", icon: FolderTree },
        { href: "/admin/instructors", label: "Instructors", icon: GraduationCap },
      ],
    },
    {
      title: "People",
      items: [
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/teachers", label: "Teachers", icon: UserRoundCog },
        { href: "/admin/payouts", label: "Payouts", icon: Wallet },
        { href: "/admin/certificates", label: "Certificates", icon: Award },
      ],
    },
    {
      title: "Settings",
      items: [
        { href: "/admin/payment-methods", label: "Payment methods", icon: WalletCards },
        { href: "/admin/content", label: "Site content", icon: PanelsTopLeft },
        { href: "/admin/emails", label: "Email log", icon: Mail },
        { href: "/admin/settings", label: "My account", icon: Settings },
      ],
    },
  ],
  teacher: [
    {
      items: [
        { href: "/teacher", label: "Overview", icon: LayoutDashboard },
        { href: "/teacher/students", label: "My students", icon: Users },
        { href: "/teacher/earnings", label: "Earnings", icon: Wallet },
      ],
    },
    { title: "Account", items: [{ href: "/teacher/settings", label: "Settings", icon: Settings }] },
  ],
  student: [
    {
      items: [
        { href: "/student", label: "My courses", icon: BookOpen },
        { href: "/student/certificates", label: "Certificates", icon: Award },
      ],
    },
    { title: "Account", items: [{ href: "/student/settings", label: "Settings", icon: Settings }] },
  ],
};

export const PORTAL_TITLE: Record<Role, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

/** Flat list, for finding the current page's label. */
export function portalItems(role: Role): PortalNavItem[] {
  return PORTAL_NAV[role].flatMap((group) => group.items);
}

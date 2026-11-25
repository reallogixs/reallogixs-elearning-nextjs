"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, Menu } from "lucide-react";

import type { Role } from "@/types/domain";
import { useCurrentUser } from "@/lib/account/useCurrentUser";
import { BrandMark } from "@/components/brand/BrandMark";
import { IconButton } from "@/components/ui/IconButton";

import { PORTAL_TITLE, portalItems } from "./navConfig";
import { PendingCount } from "./PendingCount";
import { isActivePath } from "./PortalNav";
import { UserAvatar } from "./UserAvatar";

interface PortalTopbarProps {
  role: Role;
  pending?: Promise<number>;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

export function PortalTopbar({
  role,
  pending,
  menuOpen,
  onOpenMenu,
}: PortalTopbarProps): ReactElement {
  const pathname = usePathname();
  const user = useCurrentUser();
  const items = portalItems(role);
  const root = items[0]?.href ?? "/";
  const current = items.find((item) => isActivePath(pathname, item.href, root));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:h-[72px] lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          label="Open menu"
          aria-expanded={menuOpen}
          onClick={onOpenMenu}
          className="lg:hidden"
        >
          <Menu className="size-5" />
        </IconButton>
        <span className="lg:hidden">
          <BrandMark tag={PORTAL_TITLE[role]} href={root} />
        </span>
        <p className="hidden truncate text-small text-ink-soft lg:block">
          {PORTAL_TITLE[role]} <span aria-hidden="true">/</span>{" "}
          <span className="font-semibold text-ink">{current?.label ?? ""}</span>
        </p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/"
          className="hidden min-h-11 items-center gap-1.5 rounded-pill px-3 text-small font-medium text-ink-soft hover:bg-canvas hover:text-ink sm:inline-flex"
        >
          View site <ExternalLink aria-hidden="true" className="size-3.5" />
        </Link>
        {role === "admin" ? (
          <PendingCount count={pending}>
            {(count) => (
              <Link
                href="/admin/payments"
                aria-label={
                  count
                    ? `${count} receipts awaiting verification`
                    : "No receipts awaiting verification"
                }
                className="relative inline-flex size-11 items-center justify-center rounded-pill text-ink-soft hover:bg-canvas hover:text-ink"
              >
                <Bell aria-hidden="true" className="size-5" />
                {count ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-2.5 right-2.5 size-2 rounded-pill bg-error ring-2 ring-white"
                  />
                ) : null}
              </Link>
            )}
          </PendingCount>
        ) : null}
        <span className="hidden items-center gap-2 pl-2 sm:flex">
          <UserAvatar name={user?.name ?? ""} size="sm" />
          <span className="hidden flex-col leading-tight md:flex">
            <span className="text-small font-semibold">{user?.name}</span>
            <span className="text-dash-meta font-normal text-ink-soft capitalize">{role}</span>
          </span>
        </span>
      </div>
    </header>
  );
}

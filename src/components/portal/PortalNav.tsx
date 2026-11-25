"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Role } from "@/types/domain";
import { cn } from "@/lib/cn";

import { PORTAL_NAV, portalItems } from "./navConfig";
import { PendingCount } from "./PendingCount";

export function isActivePath(pathname: string, href: string, root: string): boolean {
  return href === root ? pathname === root : pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNav({
  role,
  pending,
  onNavigate,
}: {
  role: Role;
  pending?: Promise<number>;
  onNavigate?: () => void;
}): ReactElement {
  const pathname = usePathname();
  const root = portalItems(role)[0]?.href ?? "/";

  return (
    <nav aria-label={`${role} portal`} className="flex flex-col gap-6">
      {PORTAL_NAV[role].map((group, index) => (
        <div key={group.title ?? index} className="flex flex-col gap-1">
          {group.title ? (
            <p className="px-3 pb-1 text-dash-meta font-semibold tracking-wide text-ink-soft/80 uppercase">
              {group.title}
            </p>
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon, badge }) => {
              const active = isActivePath(pathname, href, root);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-10 items-center gap-3 rounded-sm px-3 text-small font-medium transition-colors",
                      active
                        ? "bg-sky-100 text-navy-900"
                        : "text-ink-soft hover:bg-canvas hover:text-ink",
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-2 bottom-2 -left-4 w-1 rounded-r-pill bg-teal-600"
                      />
                    ) : null}
                    <Icon
                      aria-hidden="true"
                      className={cn("size-[18px]", active ? "text-teal-700" : "text-ink-soft/80")}
                    />
                    <span className="flex-1">{label}</span>
                    <PendingCount count={badge ? pending : undefined}>
                      {(count) =>
                        count > 0 ? (
                          <span className="min-w-6 rounded-pill bg-navy-900 px-2 text-center text-dash-meta leading-5 text-white">
                            {count}
                            <span className="sr-only"> waiting</span>
                          </span>
                        ) : null
                      }
                    </PendingCount>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, Menu } from "lucide-react";

import { cn } from "@/lib/cn";
import { useDb } from "@/lib/store/hooks";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { IconButton } from "@/components/ui/IconButton";

import { AccountLink } from "./AccountLink";
import { SITE_NAV } from "./navigation";

/** Mobile site menu: a right-hand drawer with the main links, account and contact. */
export function MobileNav(): ReactElement {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { contact } = useDb().content;
  const close = (): void => setOpen(false);

  return (
    <div className="lg:hidden">
      <IconButton
        label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="text-[var(--header-fg)] hover:bg-[var(--header-hover)]"
      >
        <Menu className="size-5" />
      </IconButton>
      <Drawer
        open={open}
        onClose={close}
        title="Menu"
        header={<BrandMark />}
        footer={
          <div className="flex flex-col gap-3" onClick={close}>
            <Button href="/courses" arrow className="w-full">
              Enrol now
            </Button>
            <AccountLink className="w-full" />
          </div>
        }
      >
        <nav aria-label="Mobile" className="px-3 py-4">
          <ul className="flex flex-col gap-1">
            {SITE_NAV.map((item) => {
              const active = item.href === pathname;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center justify-between rounded-sm px-3 text-body-lg font-medium",
                      active ? "bg-sky-100 text-navy-900" : "hover:bg-mist",
                    )}
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden="true" className="size-4 text-ink-soft" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mx-6 border-t border-line pt-5 pb-6">
          <p className="font-mono text-label text-ink-soft uppercase">Questions?</p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-2 flex min-h-11 items-center gap-2 text-small text-ink hover:text-teal-700"
          >
            <Mail aria-hidden="true" className="size-4 text-teal-600" />
            {contact.email}
          </a>
        </div>
      </Drawer>
    </div>
  );
}

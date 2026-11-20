"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";

import { AccountLink } from "./AccountLink";
import { SITE_NAV } from "./navigation";

export function MobileNav(): ReactElement {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);

  return (
    <div className="lg:hidden">
      <IconButton label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <Menu className="size-5" />
      </IconButton>
      <Modal open={open} onClose={close} title="Menu" size="sm">
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center border-b border-line font-display text-h4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-wrap gap-3" onClick={close}>
          <AccountLink />
          <Button href="/courses" size="sm" arrow>
            Enrol now
          </Button>
        </div>
      </Modal>
    </div>
  );
}

import type { ReactElement } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";

import { AccountLink } from "./AccountLink";
import { MobileNav } from "./MobileNav";
import { SITE_NAV } from "./navigation";

export function SiteHeader(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/88 backdrop-blur-md">
      <div className="shell flex h-header items-center justify-between gap-6">
        <BrandMark />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-pill px-4 text-small font-medium whitespace-nowrap text-ink-soft transition-colors hover:bg-mist hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <AccountLink className="hidden sm:inline-flex" />
          <Button href="/courses" size="sm" arrow className="hidden sm:inline-flex">
            Enrol now
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

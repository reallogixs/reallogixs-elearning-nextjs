"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";

import { AccountLink } from "./AccountLink";
import { MobileNav } from "./MobileNav";
import { SITE_NAV } from "./navigation";

/** Header colours come from --header-* (globals.css), so it can sit over a dark hero. */
export function SiteHeader(): ReactElement {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = (): void => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header data-scrolled={scrolled} className="site-header sticky top-0 z-40">
      <div className="shell flex h-header items-center justify-between gap-6">
        <BrandMark tone="header" />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-pill px-4 text-small font-medium whitespace-nowrap text-[var(--header-fg-soft)] transition-colors hover:bg-[var(--header-hover)] hover:text-[var(--header-fg)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <AccountLink className="hidden border-[var(--header-fg)] text-[var(--header-fg)] sm:inline-flex" />
          <Button
            href="/courses"
            size="sm"
            arrow
            className="hidden bg-[var(--header-cta-bg)] text-[var(--header-cta-fg)] hover:text-white sm:inline-flex"
          >
            Enrol now
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

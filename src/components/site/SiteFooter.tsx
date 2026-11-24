"use client";

import type { ReactElement } from "react";
import Link from "next/link";

import { useDb } from "@/lib/store/hooks";
import { BrandMark } from "@/components/brand/BrandMark";
import { CircuitLine } from "@/components/brand/CircuitLine";
import { Button } from "@/components/ui/Button";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/track", label: "Track enrolment" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create student account" },
      { href: "/login?role=teacher", label: "Teacher login" },
    ],
  },
] as const;

export function SiteFooter(): ReactElement {
  const { content } = useDb();
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark relative overflow-hidden bg-navy-950 text-on-dark">
      <CircuitLine className="absolute inset-x-0 top-0 opacity-40" />
      <div className="shell flex flex-col gap-12 py-16 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-2xl font-display text-h1 text-white">
            {content.footer.headline}{" "}
            {content.footer.highlight ? (
              <span className="text-gradient-light">{content.footer.highlight}</span>
            ) : null}
          </p>
          <Button href="/courses" tone="dark" arrow>
            {content.footer.ctaLabel}
          </Button>
        </div>

        <div className="grid gap-10 border-t border-line-dark pt-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <BrandMark tone="dark" />
            <p className="text-small text-on-dark-soft">{content.footer.blurb}</p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-mono text-label text-on-dark-soft uppercase">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-small hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className="font-mono text-label text-on-dark-soft uppercase">Contact</h2>
            <ul className="mt-4 flex flex-col gap-3 text-small">
              <li>
                <a
                  href={`mailto:${content.contact.email}`}
                  className="inline-flex min-h-11 items-center break-all hover:text-white"
                >
                  {content.contact.email}
                </a>
              </li>
              <li>{content.contact.phone}</li>
              <li className="text-on-dark-soft">{content.contact.address}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line-dark pt-6 text-small text-on-dark-soft sm:flex-row sm:justify-between">
          <p>© {year} Reallogixs. All rights reserved.</p>
          <a
            href="https://reallogixs.com.au"
            className="inline-flex min-h-11 items-center hover:text-white"
          >
            {content.footer.tagline}
          </a>
        </div>
      </div>
    </footer>
  );
}

import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** Full trail from tablet up; on phones a single "back to parent" link so it never wraps. */
export function Breadcrumbs({ items }: { items: Crumb[] }): ReactElement {
  const parent = [...items].reverse().find((item) => item.href);
  return (
    <nav aria-label="Breadcrumb">
      {parent?.href ? (
        <Link
          href={parent.href}
          className="-ml-1 inline-flex min-h-11 items-center gap-1 pr-2 text-small font-medium text-ink-soft hover:text-ink md:hidden"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {parent.label}
        </Link>
      ) : null}
      <ol className="hidden flex-wrap items-center gap-1 text-small text-ink-soft md:flex">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight aria-hidden="true" className="size-3.5" /> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center hover:text-ink hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

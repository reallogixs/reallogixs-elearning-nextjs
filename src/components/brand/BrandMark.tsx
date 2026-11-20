import type { ReactElement } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { Logo } from "./Logo";

interface BrandMarkProps {
  href?: string;
  tone?: "light" | "dark";
  /** Small mono tag after the logo, e.g. "Academy" or "Admin". */
  tag?: string;
  className?: string;
}

/** Reallogixs logo plus the product tag, linking home. */
export function BrandMark({
  href = "/",
  tone = "light",
  tag = "Academy",
  className,
}: BrandMarkProps): ReactElement {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-3",
        tone === "dark" && "on-dark",
        className,
      )}
    >
      <Logo className="h-6 lg:h-7" />
      <span className="sr-only">Reallogixs {tag}</span>
      <span
        aria-hidden="true"
        className={cn(
          "rounded-pill border px-2 py-0.5 font-mono text-[0.6875rem] tracking-[0.12em] uppercase",
          tone === "dark" ? "border-line-dark text-on-dark-soft" : "border-line text-ink-soft",
        )}
      >
        {tag}
      </span>
    </Link>
  );
}

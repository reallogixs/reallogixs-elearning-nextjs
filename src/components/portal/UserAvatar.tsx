import type { ReactElement } from "react";

import { cn } from "@/lib/cn";
import { initials } from "@/lib/domain/format";

const SIZES = { sm: "size-8 text-[0.75rem]", md: "size-9 text-small" } as const;

/** Initials avatar on the brand gradient. Decorative; the name is always shown beside it. */
export function UserAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-pill bg-gradient-logic font-semibold text-white",
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

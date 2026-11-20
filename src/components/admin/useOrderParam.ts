"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Keeps the open order in the URL (?order=RLX-…) so it can be linked and survives refresh. */
export function useOrderParam(): [string | null, (id: string | null) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const set = useCallback(
    (id: string | null) =>
      router.replace(id ? `${pathname}?order=${id}` : pathname, { scroll: false }),
    [router, pathname],
  );
  return [params.get("order"), set];
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 15_000;

/** Reloads the page's server data now and then while something can change on its own. */
export function useAutoRefresh(active: boolean): void {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      if (!document.hidden) router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [active, router]);
}

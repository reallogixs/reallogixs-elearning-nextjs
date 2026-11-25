"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { Role } from "@/types/domain";
import { PAGE, startLoading } from "@/lib/loadingBar";
import { PORTAL_HOME } from "@/components/site/navigation";

import { refreshAccount } from "./accountStore";

/** After signing in: go to the portal (or where they were headed) with a fresh account. */
export function useEnterPortal(): (role: Role, next?: string | null) => Promise<void> {
  const router = useRouter();
  return useCallback(
    async (role, next) => {
      startLoading(PAGE);
      await refreshAccount();
      router.push(next ?? PORTAL_HOME[role]);
      router.refresh();
    },
    [router],
  );
}

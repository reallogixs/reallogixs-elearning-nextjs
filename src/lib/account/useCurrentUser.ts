"use client";

import { useMemo } from "react";

import type { User } from "@/types/domain";

import { useAccount } from "./AccountContext";

/** The signed-in account in the shape the screens use. */
export function useCurrentUser(): User | null {
  const account = useAccount();
  return useMemo(() => {
    if (!account) return null;
    const { role, teacher, ...rest } = account;
    const base = { ...rest, createdAt: "" };
    if (role !== "teacher") return { ...base, role };
    const rates = teacher ?? { promoCode: "", commissionPct: 0, discountPct: 0 };
    return { ...base, role, ...rates, active: true };
  }, [account]);
}

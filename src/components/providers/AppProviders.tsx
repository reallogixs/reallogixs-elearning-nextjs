"use client";

import type { ReactElement, ReactNode } from "react";

import { useStoreHydration } from "@/lib/store/hooks";
import { ToastProvider } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: ReactNode }): ReactElement {
  useStoreHydration();
  return <ToastProvider>{children}</ToastProvider>;
}

"use client";

import { Suspense, type ReactElement, type ReactNode } from "react";

import { useAccountLoad } from "@/lib/account/accountStore";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { ToastProvider } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: ReactNode }): ReactElement {
  useAccountLoad();
  return (
    <ToastProvider>
      <Suspense>
        <LoadingBar />
      </Suspense>
      {children}
    </ToastProvider>
  );
}

"use client";

import { createContext, use, useContext, useState, type ReactElement, type ReactNode } from "react";

import type { PortalData } from "@/types/portal";

interface Value {
  data: PortalData;
  /** Shows an action's answer at once, e.g. after a new receipt. */
  update: (next: PortalData) => void;
}

const Context = createContext<Value | null>(null);

function mergeById<T extends { id: string }>(before: T[], after: T[]): T[] {
  return [...before.filter((item) => !after.some((other) => other.id === item.id)), ...after];
}

function merge(base: PortalData, next: PortalData): PortalData {
  return {
    ...base,
    orders: mergeById(base.orders, next.orders),
    courses: mergeById(next.courses, base.courses),
    paymentMethods: mergeById(next.paymentMethods, base.paymentMethods),
    certificates: mergeById(base.certificates, next.certificates),
  };
}

/** What the server loaded for this viewer. Personal data, so it lives only as long as the page. */
export function PortalDataProvider({
  data: source,
  children,
}: {
  /** A promise suspends, so put a `<Suspense>` around the provider. */
  data: PortalData | Promise<PortalData>;
  children: ReactNode;
}): ReactElement {
  const data = "then" in source ? use(source) : source;
  const [patch, setPatch] = useState<{ base: PortalData; next: PortalData } | null>(null);
  // A refresh brings newer data, which replaces any patch made on the old.
  const current = patch?.base === data ? patch.next : data;
  return (
    <Context
      value={{
        data: current,
        update: (next) => setPatch({ base: data, next: merge(current, next) }),
      }}
    >
      {children}
    </Context>
  );
}

function useValue(): Value {
  const value = useContext(Context);
  if (!value) throw new Error("Portal data is missing on this page.");
  return value;
}

export function usePortalData(): PortalData {
  return useValue().data;
}

export function useUpdatePortalData(): Value["update"] {
  return useValue().update;
}

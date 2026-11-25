"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** False during server rendering and the first client render, then true. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

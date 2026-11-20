"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Database, Session, User } from "@/types/domain";

import { dbStore, hydrateStores, hydrationStore, sessionStore } from "./db";

export function useDb(): Database {
  return useSyncExternalStore(dbStore.subscribe, dbStore.get, dbStore.get);
}

export function useSession(): Session | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
}

/** False until saved demo data has loaded; portals wait for it before guarding routes. */
export function useHydrated(): boolean {
  return useSyncExternalStore(hydrationStore.subscribe, hydrationStore.get, () => false);
}

export function useCurrentUser(): User | null {
  const session = useSession();
  const db = useDb();
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) ?? null;
}

/** Mount once in the root layout. */
export function useStoreHydration(): void {
  useEffect(() => {
    hydrateStores();
  }, []);
}

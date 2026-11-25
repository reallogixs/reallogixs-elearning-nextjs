"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Account } from "@/types/account";
import { createStore } from "@/lib/createStore";

interface State {
  account: Account | null;
  /** False until the first answer, so pages don't act as if nobody is signed in. */
  loaded: boolean;
}

const INITIAL: State = { account: null, loaded: false };
const store = createStore<State>(INITIAL);

/** Asks the server who is signed in. Call after login and logout. */
export async function refreshAccount(): Promise<void> {
  let account: Account | null = null;
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    if (response.ok) ({ account } = (await response.json()) as { account: Account | null });
  } catch {
    // Offline: treat as signed out. The server decides what anyone can see anyway.
  }
  store.set(() => ({ account, loaded: true }));
}

function useAccountState(): State {
  return useSyncExternalStore(store.subscribe, store.get, () => INITIAL);
}

export function useFetchedAccount(): Account | null {
  return useAccountState().account;
}

export function useAccountLoaded(): boolean {
  return useAccountState().loaded;
}

/** Mount once in the root layout. */
export function useAccountLoad(): void {
  useEffect(() => {
    void refreshAccount();
  }, []);
}

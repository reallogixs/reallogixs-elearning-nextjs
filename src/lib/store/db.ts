import type { Database, Session } from "@/types/domain";
import { createSeed } from "@/mocks/seed";

import { createStore } from "./createStore";
import { upgradeDatabase } from "./upgrade";

/**
 * MOCK BACKEND. The whole database lives in the browser (localStorage) so every
 * portal shares state in the demo. `src/lib/api/*` is the only code that writes to
 * it; replace those functions with Supabase calls and the UI stays the same.
 */
const DB_KEY = "rlx-academy-db";

export const dbStore = createStore<Database>(createSeed(), DB_KEY);
export const sessionStore = createStore<Session | null>(null, "rlx-academy-session");
export const hydrationStore = createStore<boolean>(false);

function isSession(raw: unknown): raw is Session {
  return typeof raw === "object" && raw !== null && typeof (raw as Session).userId === "string";
}

let hydrated = false;

/** Loads saved demo data once, after the first client render (avoids hydration mismatches). */
export function hydrateStores(): void {
  if (hydrated) return;
  hydrated = true;
  dbStore.hydrate(upgradeDatabase);
  sessionStore.hydrate((raw) => (isSession(raw) ? raw : null));
  hydrationStore.set(() => true);
  // Keep open tabs in step, so a host in one tab and a student in another share one class.
  window.addEventListener("storage", (event) => {
    if (event.key === DB_KEY) dbStore.hydrate(upgradeDatabase);
  });
}

export function resetDemoData(): void {
  dbStore.set(() => createSeed());
  sessionStore.set(() => null);
}

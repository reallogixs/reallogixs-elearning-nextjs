import type { Database, Session, SiteContent } from "@/types/domain";
import { createSeed, DB_VERSION } from "@/mocks/seed";

import { createStore } from "./createStore";

/**
 * MOCK BACKEND. The whole database lives in the browser (localStorage) so every
 * portal shares state in the demo. `src/lib/api/*` is the only code that writes to
 * it; replace those functions with Supabase calls and the UI stays the same.
 */
export const dbStore = createStore<Database>(createSeed(), "rlx-academy-db");
export const sessionStore = createStore<Session | null>(null, "rlx-academy-session");
export const hydrationStore = createStore<boolean>(false);

function isDatabase(raw: unknown): raw is Database {
  return typeof raw === "object" && raw !== null && (raw as Database).version === DB_VERSION;
}

function isSession(raw: unknown): raw is Session {
  return typeof raw === "object" && raw !== null && typeof (raw as Session).userId === "string";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Saved values win; any field added since they were saved is filled from the defaults. */
function withDefaults<T>(defaults: T, saved: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(saved)) return (saved ?? defaults) as T;
  const merged: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(saved)) {
    merged[key] =
      key in defaults ? withDefaults((defaults as Record<string, unknown>)[key], value) : value;
  }
  return merged as T;
}

/** Keeps a saved demo database usable after new content fields are added. */
function migrate(db: Database): Database {
  return { ...db, content: withDefaults<SiteContent>(createSeed().content, db.content) };
}

let hydrated = false;

/** Loads saved demo data once, after the first client render (avoids hydration mismatches). */
export function hydrateStores(): void {
  if (hydrated) return;
  hydrated = true;
  dbStore.hydrate((raw) => (isDatabase(raw) ? migrate(raw) : null));
  sessionStore.hydrate((raw) => (isSession(raw) ? raw : null));
  hydrationStore.set(() => true);
}

export function resetDemoData(): void {
  dbStore.set(() => createSeed());
  sessionStore.set(() => null);
}

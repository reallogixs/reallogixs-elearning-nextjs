type Listener = () => void;

export interface Store<T> {
  get: () => T;
  set: (updater: (current: T) => T) => void;
  subscribe: (listener: Listener) => () => void;
}

/** Tiny external store for useSyncExternalStore, optionally persisted to localStorage. */
export function createStore<T>(
  initial: T,
  storageKey?: string,
): Store<T> & { hydrate: (parse: (raw: unknown) => T | null) => void } {
  let state = initial;
  const listeners = new Set<Listener>();

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  function persist(): void {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save demo data (storage full or blocked).", error);
    }
  }

  return {
    get: () => state,
    set(updater) {
      state = updater(state);
      persist();
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrate(parse) {
      if (!storageKey || typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        const parsed = raw ? parse(JSON.parse(raw)) : null;
        if (parsed) state = parsed;
      } catch {
        // Corrupt or blocked storage: keep the seed.
      }
      emit();
    },
  };
}

type Listener = () => void;

export interface Store<T> {
  get: () => T;
  set: (updater: (current: T) => T) => void;
  subscribe: (listener: Listener) => () => void;
}

/** Tiny external store for useSyncExternalStore. In memory only. */
export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(updater) {
      state = updater(state);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

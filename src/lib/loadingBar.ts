import { createStore } from "@/lib/createStore";

/*
 * What the top loading bar is waiting for. Anything slow can hold it open under its own key, and
 * it finishes when the last one is done.
 */
export const loadingStore = createStore<ReadonlySet<string>>(new Set());

export function startLoading(key: string): void {
  loadingStore.set((current) => new Set(current).add(key));
}

export function stopLoading(key: string): void {
  loadingStore.set((current) => {
    if (!current.has(key)) return current;
    const next = new Set(current);
    next.delete(key);
    return next;
  });
}

/** Call just before `router.push`; links are noticed by themselves. */
export const PAGE = "page";

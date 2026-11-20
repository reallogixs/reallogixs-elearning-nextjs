import type { Database } from "@/types/domain";
import type { Result } from "@/types/forms";
import { dbStore } from "@/lib/store/db";

const LATENCY_MS = 350;

/** Mimics network latency so loading states are visible in the demo. */
export function latency(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function read(): Database {
  return dbStore.get();
}

export function write(updater: (db: Database) => Database): void {
  dbStore.set(updater);
}

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Replaces one record by id. */
export function replaceById<T extends { id: string }>(
  list: T[],
  id: string,
  update: (item: T) => T,
): T[] {
  return list.map((item) => (item.id === id ? update(item) : item));
}

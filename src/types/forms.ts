/** Result shape every mock API mutation returns (mirrors the future server actions). */
export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

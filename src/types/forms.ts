/** Result shape every server action returns. */
export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

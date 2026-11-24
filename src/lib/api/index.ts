/**
 * Mock API surface. Every function is async and returns `Result`, matching the
 * Supabase-backed server actions that will replace these modules.
 */
export * as authApi from "./auth";
export * as catalogueApi from "./catalogue";
export * as meetingsApi from "./meetings";
export * as ordersApi from "./orders";
export * as settingsApi from "./settings";
export * as teachersApi from "./teachers";

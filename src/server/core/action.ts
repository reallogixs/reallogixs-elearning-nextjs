import "server-only";

import type { AnyObjectSchema, InferType } from "yup";

import type { Role } from "@/types/domain";
import type { Result } from "@/types/forms";
import { validateWith } from "@/lib/validation/validate";

import { ActionError } from "./errors";
import { currentUser, type SessionUser } from "./session";

const UNEXPECTED = "Something went wrong. Please try again.";

/** Turns known problems into a message; anything else is logged without personal data. */
async function guard<T>(name: string, work: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    if (error instanceof ActionError) return { ok: false, error: error.message };
    // Database errors can quote row values, so only their type and code are logged.
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    // Two people saved the same unique value at the same moment.
    if (code === "P2002")
      return { ok: false, error: "That was just taken by another change. Refresh and try again." };
    console.error(`[action:${name}]`, error instanceof Error ? error.name : "unknown", code);
    return { ok: false, error: UNEXPECTED };
  }
}

async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new ActionError("Please log in again.");
  return user;
}

async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) throw new ActionError("You don't have access to this.");
  return user;
}

/** An action anyone can call (checkout, login…). Input is checked with the Yup schema first. */
export function publicAction<S extends AnyObjectSchema, T>(
  name: string,
  schema: S,
  work: (input: InferType<S>, user: SessionUser | null) => Promise<T>,
): (input: InferType<S>) => Promise<Result<T>> {
  return async (input) =>
    guard(name, async () => {
      const checked = await validateWith(schema, input);
      if (!checked.ok) throw new ActionError(checked.error);
      return work(checked.data, await currentUser());
    });
}

/** An action for one role. The role is checked before the input is even looked at. */
export function roleAction<S extends AnyObjectSchema, T>(
  name: string,
  role: Role,
  schema: S,
  work: (input: InferType<S>, user: SessionUser) => Promise<T>,
): (input: InferType<S>) => Promise<Result<T>> {
  return async (input) =>
    guard(name, async () => {
      const user = await requireRole(role);
      const checked = await validateWith(schema, input);
      if (!checked.ok) throw new ActionError(checked.error);
      return work(checked.data, user);
    });
}

/** An action for anyone signed in. */
export function userAction<S extends AnyObjectSchema, T>(
  name: string,
  schema: S,
  work: (input: InferType<S>, user: SessionUser) => Promise<T>,
): (input: InferType<S>) => Promise<Result<T>> {
  return async (input) =>
    guard(name, async () => {
      const user = await requireUser();
      const checked = await validateWith(schema, input);
      if (!checked.ok) throw new ActionError(checked.error);
      return work(checked.data, user);
    });
}

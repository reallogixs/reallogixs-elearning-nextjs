import { ValidationError, type AnyObjectSchema, type InferType } from "yup";

import type { Result } from "@/types/forms";

/**
 * Re-runs a form's Yup schema inside the API, the way the server will once Supabase
 * lands, so bad input can't skip client validation.
 */
export async function validateWith<S extends AnyObjectSchema>(
  schema: S,
  value: unknown,
): Promise<Result<InferType<S>>> {
  try {
    const data = (await schema.validate(value, {
      abortEarly: true,
      stripUnknown: true,
    })) as InferType<S>;
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ValidationError)
      return { ok: false, error: error.errors[0] ?? "Check the form and try again." };
    throw error;
  }
}

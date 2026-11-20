"use client";

import { getIn, useFormikContext } from "formik";

/** Error for a (possibly nested) field, shown once touched or after a submit attempt. */
export function useFieldError(name: string): string | undefined {
  const { errors, touched, submitCount } = useFormikContext<object>();
  const error: unknown = getIn(errors, name);
  const shown = Boolean(getIn(touched, name)) || submitCount > 0;
  return shown && typeof error === "string" ? error : undefined;
}

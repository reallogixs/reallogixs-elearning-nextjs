"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useField } from "formik";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

import { useFieldError } from "./useFieldError";

interface TextFieldProps extends Omit<ComponentProps<"input">, "name"> {
  name: string;
  label: string;
  hint?: ReactNode;
  optional?: boolean;
  fieldClassName?: string;
}

/** Formik-bound text input with label, hint and Yup error. */
export function TextField({
  name,
  label,
  hint,
  optional,
  fieldClassName,
  type = "text",
  ...rest
}: TextFieldProps): ReactElement {
  const [field] = useField({ name, type });
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={fieldClassName}>
      {(control) => (
        <Input {...control} {...field} value={field.value ?? ""} type={type} {...rest} />
      )}
    </Field>
  );
}

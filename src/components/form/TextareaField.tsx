"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useField } from "formik";

import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

import { useFieldError } from "./useFieldError";

interface TextareaFieldProps extends Omit<ComponentProps<"textarea">, "name"> {
  name: string;
  label: string;
  hint?: ReactNode;
  optional?: boolean;
  fieldClassName?: string;
}

export function TextareaField({
  name,
  label,
  hint,
  optional,
  fieldClassName,
  ...rest
}: TextareaFieldProps): ReactElement {
  const [field] = useField<string>(name);
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={fieldClassName}>
      {(control) => <Textarea {...control} {...field} value={field.value ?? ""} {...rest} />}
    </Field>
  );
}

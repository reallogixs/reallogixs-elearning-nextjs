"use client";

import type { ReactElement, ReactNode } from "react";
import { useField } from "formik";

import { Field } from "@/components/ui/Field";
import { Select, type SelectOption } from "@/components/ui/Select";

import { useFieldError } from "./useFieldError";

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: ReactNode;
  fieldClassName?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  hint,
  fieldClassName,
}: SelectFieldProps): ReactElement {
  const [field] = useField<string>(name);
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} className={fieldClassName}>
      {(control) => (
        <Select
          {...control}
          {...field}
          value={field.value ?? ""}
          options={options}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}

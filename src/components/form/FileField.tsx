"use client";

import type { ReactElement } from "react";
import { useField } from "formik";

import { FileDrop } from "@/components/ui/FileDrop";

import { useFieldError } from "./useFieldError";

interface FileFieldProps {
  name: string;
  label: string;
  hint: string;
  accept: string;
}

/** Holds the File in Formik state; type and size rules live in the Yup schema. */
export function FileField({ name, label, hint, accept }: FileFieldProps): ReactElement {
  const [field, , helpers] = useField<File | null>(name);
  const error = useFieldError(name);
  return (
    <FileDrop
      label={label}
      hint={hint}
      accept={accept}
      file={field.value}
      error={error}
      onChange={(file) => {
        void helpers.setTouched(true, false);
        void helpers.setValue(file);
      }}
    />
  );
}

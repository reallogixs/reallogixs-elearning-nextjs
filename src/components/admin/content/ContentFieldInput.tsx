"use client";

import type { ReactElement } from "react";

import { SwitchField } from "@/components/form/SwitchField";
import { TextField } from "@/components/form/TextField";
import { TextareaField } from "@/components/form/TextareaField";

import type { ContentField } from "./fieldTypes";

/** Renders the right Formik field for a content field definition. */
export function ContentFieldInput<T extends object>({
  field,
  name,
}: {
  field: ContentField<T>;
  name: string;
}): ReactElement {
  if (field.kind === "boolean")
    return <SwitchField name={name} label={field.label} description={field.hint} />;
  if (field.kind === "multiline") {
    return (
      <TextareaField
        name={name}
        label={field.label}
        hint={field.hint}
        optional={field.optional}
        rows={3}
        fieldClassName="md:col-span-2"
      />
    );
  }
  return (
    <TextField
      name={name}
      label={field.label}
      hint={field.hint}
      optional={field.optional}
      type={field.kind === "url" ? "url" : "text"}
    />
  );
}

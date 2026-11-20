"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";
import type { AnyObjectSchema } from "yup";

import type { Result } from "@/types/forms";
import { useAction } from "@/lib/useAction";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Card } from "@/components/ui/Card";

import { ContentFieldInput } from "./ContentFieldInput";
import type { ContentField } from "./fieldTypes";

interface ContentSectionProps<T extends object> {
  title: string;
  description?: string;
  fields: ContentField<T>[];
  value: T;
  schema: AnyObjectSchema;
  onSave: (value: T) => Promise<Result>;
}

/** Edits one flat object of site copy (e.g. the hero) and saves it as a unit. */
export function ContentSection<T extends object>({
  title,
  description,
  fields,
  value,
  schema,
  onSave,
}: ContentSectionProps<T>): ReactElement {
  const { run } = useAction();
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-h4">{title}</h2>
        {description ? <p className="text-small text-ink-soft">{description}</p> : null}
      </div>
      <Formik
        initialValues={value}
        validationSchema={schema}
        onSubmit={async (values) =>
          void (await run("save", () => onSave(schema.cast(values) as T), `${title} saved.`))
        }
      >
        <Form noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <ContentFieldInput key={field.key} field={field} name={field.key} />
            ))}
          </div>
          <SubmitButton size="sm" className="self-start">
            Save {title.toLowerCase()}
          </SubmitButton>
        </Form>
      </Formik>
    </Card>
  );
}

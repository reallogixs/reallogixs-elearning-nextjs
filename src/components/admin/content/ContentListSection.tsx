"use client";

import type { ReactElement } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { FieldArray, Form, Formik } from "formik";
import type { AnyObjectSchema } from "yup";

import type { Result } from "@/types/forms";
import { useAction } from "@/lib/useAction";
import { SubmitButton } from "@/components/form/SubmitButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";

import { ContentFieldInput } from "./ContentFieldInput";
import type { ContentField } from "./fieldTypes";

interface ContentListSectionProps<T extends object> {
  title: string;
  description?: string;
  itemLabel: string;
  fields: ContentField<T>[];
  items: T[];
  /** Yup schema of shape `{ items: array(...) }`. */
  schema: AnyObjectSchema;
  createItem: () => T;
  onSave: (items: T[]) => Promise<Result>;
}

/** Add, remove, reorder and edit a list of content items (FAQs, steps, testimonials…). */
export function ContentListSection<T extends object>({
  title,
  description,
  itemLabel,
  fields,
  items,
  schema,
  createItem,
  onSave,
}: ContentListSectionProps<T>): ReactElement {
  const { run } = useAction();
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-h4">{title}</h2>
        {description ? <p className="text-small text-ink-soft">{description}</p> : null}
      </div>
      <Formik
        initialValues={{ items }}
        validationSchema={schema}
        onSubmit={async (values) =>
          void (await run(
            "save",
            () => onSave((schema.cast(values) as { items: T[] }).items),
            `${title} saved.`,
          ))
        }
      >
        {({ values }) => (
          <Form noValidate className="flex flex-col gap-5">
            <FieldArray name="items">
              {({ push, remove, move }) => (
                <>
                  <ol className="flex flex-col gap-4">
                    {values.items.map((_, index) => (
                      <li
                        key={index}
                        className="flex flex-col gap-4 rounded-md border border-line p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-label text-ink-soft uppercase">
                            {itemLabel} {index + 1}
                          </p>
                          <div className="flex">
                            <IconButton
                              label={`Move ${itemLabel} ${index + 1} up`}
                              disabled={index === 0}
                              onClick={() => move(index, index - 1)}
                            >
                              <ArrowUp className="size-4" />
                            </IconButton>
                            <IconButton
                              label={`Move ${itemLabel} ${index + 1} down`}
                              disabled={index === values.items.length - 1}
                              onClick={() => move(index, index + 1)}
                            >
                              <ArrowDown className="size-4" />
                            </IconButton>
                            <IconButton
                              label={`Remove ${itemLabel} ${index + 1}`}
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="size-4 text-error-text" />
                            </IconButton>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {fields.map((field) => (
                            <ContentFieldInput
                              key={field.key}
                              field={field}
                              name={`items.${index}.${field.key}`}
                            />
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Plus className="size-4" />}
                      onClick={() => push(createItem())}
                    >
                      Add {itemLabel.toLowerCase()}
                    </Button>
                    <SubmitButton size="sm">Save {title.toLowerCase()}</SubmitButton>
                  </div>
                </>
              )}
            </FieldArray>
          </Form>
        )}
      </Formik>
    </Card>
  );
}

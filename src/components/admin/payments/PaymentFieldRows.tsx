"use client";

import type { ReactElement } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { FieldArray, useFormikContext } from "formik";

import { newId } from "@/lib/domain/ids";
import type { PaymentMethodFormValues } from "@/lib/validation/admin";
import { SwitchField } from "@/components/form/SwitchField";
import { TextField } from "@/components/form/TextField";
import { useFieldError } from "@/components/form/useFieldError";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

/** Any number of label/value rows (Account title, IBAN, Till ID…), each optionally copyable. */
export function PaymentFieldRows(): ReactElement {
  const { values } = useFormikContext<PaymentMethodFormValues>();
  const listError = useFieldError("fields");

  return (
    <FieldArray name="fields">
      {({ push, remove, move }) => (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-small font-medium">Payment details shown to students</legend>
          {values.fields.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-md border border-line p-3 md:grid-cols-[1fr_1.4fr_auto] md:items-start"
            >
              <TextField
                name={`fields.${index}.label`}
                label={`Row ${index + 1} label`}
                placeholder="e.g. IBAN"
              />
              <TextField
                name={`fields.${index}.value`}
                label="Value"
                placeholder="e.g. PK00 MEZN 0001 2345"
                className="font-mono"
              />
              <div className="flex items-center md:mt-7">
                <IconButton
                  label={`Move row ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton
                  label={`Move row ${index + 1} down`}
                  disabled={index === values.fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton label={`Remove row ${index + 1}`} onClick={() => remove(index)}>
                  <Trash2 className="size-4 text-error-text" />
                </IconButton>
              </div>
              <SwitchField
                name={`fields.${index}.copyable`}
                label="Show a copy button"
                className="md:col-span-3"
              />
            </div>
          ))}
          {listError ? <p className="text-small text-error-text">{listError}</p> : null}
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            icon={<Plus className="size-4" />}
            onClick={() => push({ id: newId("pmf"), label: "", value: "", copyable: false })}
          >
            Add detail row
          </Button>
        </fieldset>
      )}
    </FieldArray>
  );
}

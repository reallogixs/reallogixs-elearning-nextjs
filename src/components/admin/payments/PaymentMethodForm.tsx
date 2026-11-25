"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import type { PaymentMethod } from "@/types/domain";
import { newId } from "@/lib/domain/ids";
import { useAction } from "@/lib/useAction";
import { paymentMethodSchema, type PaymentMethodFormValues } from "@/lib/validation/admin";
import { SubmitButton } from "@/components/form/SubmitButton";
import { SwitchField } from "@/components/form/SwitchField";
import { TextField } from "@/components/form/TextField";
import { TextareaField } from "@/components/form/TextareaField";
import { PaymentAccountDetails } from "@/components/payments/PaymentAccountDetails";
import { Button } from "@/components/ui/Button";
import { savePaymentMethod } from "@/server/actions/paymentMethods";

import { LogoUploadField } from "./LogoUploadField";
import { PaymentFieldRows } from "./PaymentFieldRows";

function toForm(method?: PaymentMethod): PaymentMethodFormValues {
  return {
    name: method?.name ?? "",
    logoUrl: method?.logoUrl ?? null,
    fields: method?.fields ?? [
      { id: newId("pmf"), label: "Account title", value: "", copyable: false },
      { id: newId("pmf"), label: "Account number", value: "", copyable: true },
    ],
    instructions: method?.instructions ?? "",
    enabled: method?.enabled ?? true,
  };
}

const PREVIEW_AMOUNT = 25000;

export function PaymentMethodForm({
  method,
  onDone,
}: {
  method?: PaymentMethod;
  onDone: () => void;
}): ReactElement {
  const { run } = useAction();
  return (
    <Formik
      initialValues={toForm(method)}
      validationSchema={paymentMethodSchema}
      onSubmit={async (values) => {
        const result = await run(
          "save",
          () => savePaymentMethod({ ...paymentMethodSchema.cast(values), id: method?.id ?? "" }),
          "Payment method saved.",
        );
        if (result.ok) onDone();
      }}
    >
      {({ values }) => (
        <Form noValidate className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <TextField name="name" label="Method name" placeholder="e.g. JazzCash" />
            <LogoUploadField name="logoUrl" methodName={values.name} />
            <PaymentFieldRows />
            <TextareaField name="instructions" label="Instructions for students" rows={3} />
            <SwitchField name="enabled" label="Show at checkout" />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={onDone}>
                Cancel
              </Button>
              <SubmitButton size="sm">Save payment method</SubmitButton>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:sticky lg:top-0 lg:self-start">
            <p className="font-mono text-label text-ink-soft uppercase">Student preview</p>
            <PaymentAccountDetails
              amount={PREVIEW_AMOUNT}
              method={{
                ...values,
                id: "preview",
                order: 0,
                name: values.name || "Payment method",
                logoUrl: values.logoUrl ?? null,
              }}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}

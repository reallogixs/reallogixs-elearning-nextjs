"use client";

import type { ReactElement, ReactNode } from "react";
import { Form, Formik } from "formik";

import type { Result } from "@/types/forms";
import { prepareReceipt } from "@/lib/files";
import { receiptSchema, type ReceiptInput } from "@/lib/validation/checkout";
import { FileField } from "@/components/form/FileField";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";

interface ReceiptFormProps {
  help: string;
  submitLabel: string;
  onSubmit: (receipt: ReceiptInput) => Promise<Result<unknown>>;
  /** Extra control on the left of the submit button (e.g. Back). */
  secondaryAction?: ReactNode;
}

interface ReceiptValues {
  transactionRef: string;
  file: File | null;
}

const initialValues: ReceiptValues = { transactionRef: "", file: null };

/** Transaction reference + receipt file. Used at checkout and for re-uploads. */
export function ReceiptForm({
  help,
  submitLabel,
  onSubmit,
  secondaryAction,
}: ReceiptFormProps): ReactElement {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={receiptSchema}
      onSubmit={async (values, { setStatus }) => {
        setStatus(undefined);
        try {
          // Formik only calls onSubmit once Yup has passed, so cast gives the typed File.
          const { file, transactionRef } = receiptSchema.cast(values);
          const result = await onSubmit({ file: await prepareReceipt(file), transactionRef });
          if (!result.ok) setStatus(result.error);
        } catch {
          setStatus(
            "We couldn't send that file. Check your connection, or try a different screenshot.",
          );
        }
      }}
    >
      <Form noValidate className="flex flex-col gap-6">
        <TextField
          name="transactionRef"
          label="Transaction ID / reference"
          hint="Printed on your receipt, e.g. JC88213470."
          autoComplete="off"
        />
        <FileField
          name="file"
          label="Payment receipt"
          hint={help}
          accept="image/jpeg,image/png,image/webp,application/pdf"
        />
        <FormStatus />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {secondaryAction ?? <span />}
          <SubmitButton arrow>{submitLabel}</SubmitButton>
        </div>
      </Form>
    </Formik>
  );
}

"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import { rejectSchema } from "@/lib/validation/admin";
import { TextareaField } from "@/components/form/TextareaField";

export const REJECT_FORM_ID = "reject-order-form";

/** The reason a receipt was rejected; submitted by the modal footer's button. */
export function RejectReasonForm({
  onSubmit,
}: {
  onSubmit: (reason: string) => Promise<void>;
}): ReactElement {
  return (
    <Formik
      initialValues={{ reason: "" }}
      validationSchema={rejectSchema}
      onSubmit={(values) => onSubmit(rejectSchema.cast(values).reason)}
    >
      <Form noValidate id={REJECT_FORM_ID}>
        <TextareaField
          name="reason"
          label="Reason (sent to the student)"
          placeholder="e.g. The amount on the receipt is Rs 30,000 but the fee is Rs 33,250."
          autoFocus
        />
      </Form>
    </Formik>
  );
}

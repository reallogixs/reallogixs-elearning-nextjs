"use client";

import type { ReactElement, ReactNode } from "react";
import { Form, Formik } from "formik";

import { contactSchema, type ContactInput } from "@/lib/validation/checkout";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";

const FORM_ID = "checkout-details";

interface DetailsStepProps {
  initialValues: ContactInput;
  /** Signed-in students can't change the email their account uses. */
  lockEmail: boolean;
  /** The promo code is its own small form (forms can't nest), placed between fields and button. */
  promoField: ReactNode;
  onNext: (contact: ContactInput) => void;
}

export function DetailsStep({
  initialValues,
  lockEmail,
  promoField,
  onNext,
}: DetailsStepProps): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <Formik
        initialValues={initialValues}
        validationSchema={contactSchema}
        onSubmit={(values) => onNext(contactSchema.cast(values))}
      >
        <Form noValidate id={FORM_ID} className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="name"
            label="Full name"
            autoComplete="name"
            fieldClassName="sm:col-span-2"
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            readOnly={lockEmail}
            hint="Use the email of your Zoom account. Only that account can join the class."
          />
          <TextField
            name="phone"
            label="WhatsApp number"
            type="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
            hint="You'll use this to track your order."
          />
        </Form>
      </Formik>
      {promoField}
      <div className="flex justify-end">
        <Button type="submit" form={FORM_ID} arrow>
          Continue to payment
        </Button>
      </div>
    </div>
  );
}

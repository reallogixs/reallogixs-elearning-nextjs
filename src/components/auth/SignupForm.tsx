"use client";

import { useState, type ReactElement } from "react";
import { Form, Formik } from "formik";

import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { requestSignup } from "@/server/actions/account";

import { CheckEmail } from "./CheckEmail";

const initialValues: SignupInput = { name: "", email: "", phone: "" };

/** `onSent` replaces the "check your email" note, e.g. to carry on with checkout. */
export function SignupForm({ onSent }: { onSent?: (values: SignupInput) => void }): ReactElement {
  const [sentTo, setSentTo] = useState<string | null>(null);
  if (sentTo)
    return (
      <CheckEmail
        email={sentTo}
        body="Open the link in it to choose a password and finish creating your account."
      />
    );
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signupSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await requestSignup(values);
        if (result.ok && onSent) onSent(signupSchema.cast(values));
        else if (result.ok) setSentTo(values.email);
        else setStatus(result.error);
      }}
    >
      <Form method="post" noValidate className="grid gap-5 sm:grid-cols-2">
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
          hint="We'll send a link to choose your password."
        />
        <TextField
          name="phone"
          label="WhatsApp number"
          type="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
        />
        <FormStatus className="sm:col-span-2" />
        <SubmitButton arrow className="sm:col-span-2 sm:justify-self-start">
          Create account
        </SubmitButton>
      </Form>
    </Formik>
  );
}

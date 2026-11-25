"use client";

import { useState, type ReactElement } from "react";
import { Form, Formik } from "formik";

import { forgotPasswordSchema } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { requestPasswordReset } from "@/server/actions/account";

import { CheckEmail } from "./CheckEmail";

export function ForgotPasswordForm(): ReactElement {
  const [sentTo, setSentTo] = useState<string | null>(null);
  if (sentTo) return <CheckEmail email={sentTo} body="The link in it works for one hour." />;
  return (
    <Formik
      initialValues={{ email: "" }}
      validationSchema={forgotPasswordSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await requestPasswordReset(values);
        if (result.ok) setSentTo(values.email);
        else setStatus(result.error);
      }}
    >
      <Form method="post" noValidate className="flex flex-col gap-5">
        <TextField name="email" label="Email" type="email" autoComplete="email" />
        <FormStatus />
        <SubmitButton arrow className="self-start">
          Send reset link
        </SubmitButton>
      </Form>
    </Formik>
  );
}

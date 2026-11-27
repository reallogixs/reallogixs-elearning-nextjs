"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import { changeEmailSchema, type ChangeEmailInput } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { requestEmailChange } from "@/server/actions/email";

const initialValues: ChangeEmailInput = { email: "", password: "" };

/** The login email only changes once the link sent to the new address is used. */
export function ChangeEmailForm(): ReactElement {
  const { notify } = useToast();
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-h4">Change login email</h2>
        <p className="text-small text-ink-soft">
          We&apos;ll send a link to the new address. Nothing changes until you open it, and an email
          another account already uses can&apos;t be chosen.
        </p>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={changeEmailSchema}
        onSubmit={async (values, { setStatus, resetForm }) => {
          setStatus(undefined);
          const result = await requestEmailChange(values);
          if (!result.ok) {
            setStatus(result.error);
            return;
          }
          resetForm();
          notify(`Link sent to ${values.email}. Open it to finish.`);
        }}
      >
        <Form method="post" noValidate className="grid gap-5 md:grid-cols-2">
          <TextField name="email" label="New email" type="email" autoComplete="email" />
          <TextField
            name="password"
            label="Current password"
            type="password"
            autoComplete="current-password"
          />
          <FormStatus className="md:col-span-2" />
          <SubmitButton className="md:col-span-2 md:justify-self-start">
            Send confirmation link
          </SubmitButton>
        </Form>
      </Formik>
    </Card>
  );
}

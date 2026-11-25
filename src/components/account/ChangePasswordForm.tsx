"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validation/auth";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { changePassword } from "@/server/actions/account";

const initialValues: ChangePasswordInput = { current: "", next: "", confirm: "" };

export function ChangePasswordForm(): ReactElement {
  const { notify } = useToast();
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-h4">Change password</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={changePasswordSchema}
        onSubmit={async (values, { setFieldError, resetForm }) => {
          const result = await changePassword(values);
          if (!result.ok) {
            setFieldError("current", result.error);
            return;
          }
          resetForm();
          notify("Password updated. Other devices were signed out.");
        }}
      >
        <Form method="post" noValidate className="grid gap-5 md:grid-cols-3">
          <TextField
            name="current"
            label="Current password"
            type="password"
            autoComplete="current-password"
          />
          <TextField name="next" label="New password" type="password" autoComplete="new-password" />
          <TextField
            name="confirm"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
          />
          <SubmitButton className="md:col-span-3 md:justify-self-start">
            Update password
          </SubmitButton>
        </Form>
      </Formik>
    </Card>
  );
}

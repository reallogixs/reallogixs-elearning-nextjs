"use client";

import type { ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";

import { useEnterPortal } from "@/lib/account/useEnterPortal";
import { setPasswordSchema } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { setPassword } from "@/server/actions/account";

/** The link is only used up by submitting, so email scanners that open it can't spend it. */
export function SetPasswordForm(): ReactElement {
  const token = useSearchParams().get("token") ?? "";
  const enterPortal = useEnterPortal();
  if (!token)
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert tone="warning">This link isn&apos;t complete. Open it again from your email.</Alert>
        <Button href="/forgot-password" size="sm" variant="secondary">
          Ask for a new link
        </Button>
      </div>
    );
  return (
    <Formik
      initialValues={{ token, password: "", confirm: "" }}
      validationSchema={setPasswordSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await setPassword(values);
        if (result.ok) await enterPortal(result.data.role);
        else setStatus(result.error);
      }}
    >
      <Form method="post" noValidate className="flex flex-col gap-5">
        <TextField
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
        />
        <TextField
          name="confirm"
          label="Type it again"
          type="password"
          autoComplete="new-password"
        />
        <FormStatus />
        <SubmitButton arrow className="self-start">
          Save and log in
        </SubmitButton>
      </Form>
    </Formik>
  );
}

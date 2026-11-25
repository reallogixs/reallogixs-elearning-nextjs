"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Form, Formik } from "formik";

import type { Role } from "@/types/domain";
import { useEnterPortal } from "@/lib/account/useEnterPortal";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { login } from "@/server/actions/account";

const initialValues: LoginInput = { email: "", password: "" };

export function LoginForm({ role, next }: { role: Role; next: string | null }): ReactElement {
  const enterPortal = useEnterPortal();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await login({ ...values, role });
        if (result.ok) await enterPortal(result.data.role, next);
        else setStatus(result.error);
      }}
    >
      <Form method="post" noValidate className="flex flex-col gap-5">
        <TextField name="email" label="Email" type="email" autoComplete="email" />
        <TextField
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <FormStatus />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SubmitButton arrow>Log in</SubmitButton>
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center text-small text-teal-700 underline"
          >
            Forgot password?
          </Link>
        </div>
      </Form>
    </Formik>
  );
}

"use client";

import type { ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";

import { authApi } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { PORTAL_HOME } from "@/components/site/navigation";
import { DEMO_ACCOUNTS } from "@/mocks/seed";

/** Only same-site paths are allowed as a post-login redirect. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

const initialValues: LoginInput = { email: "", password: "" };

export function LoginForm(): ReactElement {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await authApi.login(values.email, values.password);
        if (!result.ok) {
          setStatus(result.error);
          return;
        }
        router.push(safeNext(params.get("next")) ?? PORTAL_HOME[result.data.role]);
      }}
    >
      {({ setValues }) => (
        <div className="flex flex-col gap-6">
          <Form noValidate className="flex flex-col gap-5">
            <TextField name="email" label="Email" type="email" autoComplete="email" />
            <TextField
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
            />
            <FormStatus />
            <SubmitButton arrow className="w-full sm:w-auto sm:self-start">
              Log in
            </SubmitButton>
          </Form>
          <div className="rounded-md border border-dashed border-line p-4">
            <p className="font-mono text-label text-ink-soft uppercase">Demo accounts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    void setValues({ email: account.email, password: account.password })
                  }
                >
                  Fill {account.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
}

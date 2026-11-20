"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";

import { authApi } from "@/lib/api";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";

const initialValues: SignupInput = { name: "", email: "", phone: "", password: "" };

export function SignupForm(): ReactElement {
  const router = useRouter();
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signupSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await authApi.signupStudent(values);
        if (result.ok) router.push("/student");
        else setStatus(result.error);
      }}
    >
      <Form noValidate className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label="Full name"
          autoComplete="name"
          fieldClassName="sm:col-span-2"
        />
        <TextField name="email" label="Email" type="email" autoComplete="email" />
        <TextField
          name="phone"
          label="WhatsApp number"
          type="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          fieldClassName="sm:col-span-2"
        />
        <FormStatus className="sm:col-span-2" />
        <SubmitButton arrow className="sm:col-span-2 sm:justify-self-start">
          Create account
        </SubmitButton>
      </Form>
    </Formik>
  );
}

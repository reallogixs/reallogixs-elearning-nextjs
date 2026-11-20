"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import type { User } from "@/types/domain";
import { authApi } from "@/lib/api";
import { profileSchema } from "@/lib/validation/auth";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function ProfileForm({ user }: { user: User }): ReactElement {
  const { notify } = useToast();
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-h4">Profile</h2>
      <Formik
        initialValues={{ name: user.name, phone: user.phone }}
        validationSchema={profileSchema}
        onSubmit={async (values) => {
          const result = await authApi.updateProfile(user.id, profileSchema.cast(values));
          notify(result.ok ? "Profile saved." : result.error, result.ok ? "success" : "error");
        }}
      >
        <Form noValidate className="grid gap-5 md:grid-cols-3">
          <TextField name="name" label="Full name" autoComplete="name" />
          <Field label="Email" hint="Contact us to change your login email.">
            {(control) => <Input {...control} value={user.email} readOnly />}
          </Field>
          <TextField name="phone" label="WhatsApp number" type="tel" autoComplete="tel" />
          <SubmitButton className="md:col-span-3 md:justify-self-start">Save profile</SubmitButton>
        </Form>
      </Formik>
    </Card>
  );
}

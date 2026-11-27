"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";

import type { User } from "@/types/domain";
import { profileSchema } from "@/lib/validation/auth";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateProfile } from "@/server/actions/account";

export function ProfileForm({ user }: { user: User }): ReactElement {
  const { notify } = useToast();
  const router = useRouter();
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-h4">Profile</h2>
      <Formik
        initialValues={{ name: user.name, phone: user.phone }}
        validationSchema={profileSchema}
        onSubmit={async (values) => {
          const result = await updateProfile(profileSchema.cast(values));
          if (result.ok) router.refresh();
          notify(result.ok ? "Profile saved." : result.error, result.ok ? "success" : "error");
        }}
      >
        <Form method="post" noValidate className="grid gap-5 md:grid-cols-3">
          <TextField name="name" label="Full name" autoComplete="name" />
          <Field
            label="Email"
            hint={
              user.role !== "teacher" ? "Change it below." : "Ask the Reallogixs team to change it."
            }
          >
            {(control) => <Input {...control} value={user.email} readOnly />}
          </Field>
          <TextField name="phone" label="WhatsApp number" type="tel" autoComplete="tel" />
          <SubmitButton className="md:col-span-3 md:justify-self-start">Save profile</SubmitButton>
        </Form>
      </Formik>
    </Card>
  );
}

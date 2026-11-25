"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";

import { refreshAccount } from "@/lib/account/accountStore";
import { PAGE, startLoading } from "@/lib/loadingBar";
import { confirmEmailSchema } from "@/lib/validation/auth";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { useToast } from "@/components/ui/Toast";
import { confirmEmailChange } from "@/server/actions/adminEmail";

export function ConfirmEmailForm({ token }: { token: string }): ReactElement {
  const router = useRouter();
  const { notify } = useToast();
  return (
    <Formik
      initialValues={{ token }}
      validationSchema={confirmEmailSchema}
      onSubmit={async (values, { setStatus }) => {
        const result = await confirmEmailChange(values);
        if (!result.ok) {
          setStatus(result.error);
          return;
        }
        notify("Email changed. Log in with your new email.");
        startLoading(PAGE);
        await refreshAccount();
        router.push(result.data.next);
        router.refresh();
      }}
    >
      <Form method="post" noValidate className="flex flex-col gap-5">
        <FormStatus />
        <SubmitButton arrow className="self-start">
          Confirm new email
        </SubmitButton>
      </Form>
    </Formik>
  );
}

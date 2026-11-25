"use client";

import { useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";

import type { Certificate } from "@/types/domain";
import { verifyCertificateSchema } from "@/lib/validation/certificate";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Card } from "@/components/ui/Card";
import { verifyCertificate } from "@/server/actions/certificates";

import { CertificateResult } from "./CertificateResult";

/** Anyone can check a certificate code. Shows only what is printed on the certificate. */
export function VerifyCertificate(): ReactElement {
  const params = useSearchParams();
  const [found, setFound] = useState<Certificate | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 sm:p-8">
        <Formik
          initialValues={{ code: params.get("code") ?? "" }}
          validationSchema={verifyCertificateSchema}
          onSubmit={async (values, { setStatus }) => {
            const { code } = verifyCertificateSchema.cast(values);
            const result = await verifyCertificate({ code });
            setStatus(result.ok ? undefined : result.error);
            setFound(result.ok ? result.data : null);
          }}
        >
          <Form noValidate className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <TextField
              name="code"
              label="Certificate code"
              placeholder="CERT-7KQ2M9XA"
              className="font-mono uppercase"
              autoComplete="off"
            />
            <SubmitButton className="sm:mt-7">Verify</SubmitButton>
            <div aria-live="polite" className="sm:col-span-2">
              <FormStatus />
            </div>
          </Form>
        </Formik>
      </Card>
      <div aria-live="polite">{found ? <CertificateResult certificate={found} /> : null}</div>
    </div>
  );
}

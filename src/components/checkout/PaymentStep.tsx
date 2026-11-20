"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import type { PaymentMethod } from "@/types/domain";
import { paymentChoiceSchema } from "@/lib/validation/checkout";
import { useFieldError } from "@/components/form/useFieldError";
import { PaymentAccountDetails } from "@/components/payments/PaymentAccountDetails";
import { PaymentMethodPicker } from "@/components/payments/PaymentMethodPicker";
import { Button } from "@/components/ui/Button";

interface PaymentStepProps {
  methods: PaymentMethod[];
  amount: number;
  initialMethodId: string;
  onBack: () => void;
  onNext: (methodId: string) => void;
}

function MethodChoice({
  methods,
  amount,
  value,
  onChange,
}: {
  methods: PaymentMethod[];
  amount: number;
  value: string;
  onChange: (id: string) => void;
}): ReactElement {
  const error = useFieldError("methodId");
  const method = methods.find((candidate) => candidate.id === value);
  return (
    <>
      <PaymentMethodPicker methods={methods} value={value} onChange={onChange} error={error} />
      {method ? <PaymentAccountDetails method={method} amount={amount} /> : null}
    </>
  );
}

export function PaymentStep({
  methods,
  amount,
  initialMethodId,
  onBack,
  onNext,
}: PaymentStepProps): ReactElement {
  return (
    <Formik
      initialValues={{ methodId: initialMethodId }}
      validationSchema={paymentChoiceSchema}
      onSubmit={(values) => onNext(values.methodId)}
    >
      {({ values, setFieldValue }) => (
        <Form noValidate className="flex flex-col gap-6">
          <MethodChoice
            methods={methods}
            amount={amount}
            value={values.methodId}
            onChange={(id) => void setFieldValue("methodId", id)}
          />
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" arrow>
              I&apos;ve paid, next
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

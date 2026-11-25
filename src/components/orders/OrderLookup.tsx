"use client";

import { useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";

import type { OrderResult } from "@/types/portal";
import { orderLookupSchema } from "@/lib/validation/checkout";
import { PortalDataProvider } from "@/components/data/PortalData";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Card } from "@/components/ui/Card";
import { lookupOrder } from "@/server/actions/checkout";

import { OrderStatusPanel } from "./OrderStatusPanel";

/** Guest order tracking: order number + phone. */
export function OrderLookup(): ReactElement {
  const params = useSearchParams();
  const [found, setFound] = useState<OrderResult | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 sm:p-8">
        <Formik
          initialValues={{ orderId: params.get("order") ?? "", phone: "" }}
          validationSchema={orderLookupSchema}
          onSubmit={async (values, { setStatus }) => {
            const result = await lookupOrder(orderLookupSchema.cast(values));
            setStatus(result.ok ? undefined : result.error);
            setFound(result.ok ? result.data : null);
          }}
        >
          <Form noValidate className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <TextField
              name="orderId"
              label="Order number"
              placeholder="RLX-4F7K2P"
              className="font-mono uppercase"
              autoComplete="off"
            />
            <TextField
              name="phone"
              label="Phone used at checkout"
              type="tel"
              placeholder="0300 1234567"
              autoComplete="tel"
            />
            <SubmitButton className="sm:mt-7">Find my order</SubmitButton>
            <div aria-live="polite" className="sm:col-span-3">
              <FormStatus />
            </div>
          </Form>
        </Formik>
      </Card>
      {found ? (
        <PortalDataProvider data={found.data}>
          <OrderStatusPanel orderId={found.number} />
        </PortalDataProvider>
      ) : null}
    </div>
  );
}

"use client";

import type { ReactElement } from "react";
import { BadgePercent, X } from "lucide-react";
import { Form, Formik } from "formik";

import { ordersApi } from "@/lib/api";
import type { PromoPreview } from "@/lib/api/orders";
import { promoCodeSchema } from "@/lib/validation/checkout";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";

interface PromoCodeFieldProps {
  help: string;
  applied: PromoPreview | null;
  onApply: (promo: PromoPreview | null) => void;
}

/** Optional teacher referral code. Leaving it empty is the "skip" path. */
export function PromoCodeField({ help, applied, onApply }: PromoCodeFieldProps): ReactElement {
  if (applied) {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-md border border-success/30 bg-success/10 p-4"
        role="status"
      >
        <span className="flex items-start gap-3 text-small">
          <BadgePercent aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success-text" />
          <span>
            <span className="font-medium">{applied.code}</span> applied. Referred by{" "}
            {applied.teacherName}
            {applied.discountPct > 0 ? `, you save ${applied.discountPct}%.` : "."}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onApply(null)}
          className="inline-flex min-h-11 items-center gap-1 rounded-pill px-3 text-small text-ink-soft hover:bg-white"
        >
          <X aria-hidden="true" className="size-4" /> Remove
        </button>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{ code: "" }}
      validationSchema={promoCodeSchema}
      validateOnBlur={false}
      onSubmit={async (values, { setFieldError }) => {
        const result = await ordersApi.checkPromoCode(values.code);
        if (result.ok) onApply(result.data);
        else setFieldError("code", result.error);
      }}
    >
      <Form noValidate className="flex items-start gap-2">
        <TextField
          name="code"
          label="Teacher promo code"
          optional
          hint={help}
          placeholder="e.g. SANA-K7Q"
          autoComplete="off"
          className="font-mono uppercase"
          fieldClassName="flex-1"
        />
        <SubmitButton variant="secondary" className="mt-7">
          Apply
        </SubmitButton>
      </Form>
    </Formik>
  );
}

import type { ReactElement } from "react";

import type { PaymentMethod } from "@/types/domain";
import { cn } from "@/lib/cn";

import { PaymentMethodLogo } from "./PaymentMethodLogo";

interface PaymentMethodPickerProps {
  methods: PaymentMethod[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

/** Radio cards for the payment methods the admin has enabled. */
export function PaymentMethodPicker({
  methods,
  value,
  onChange,
  error,
}: PaymentMethodPickerProps): ReactElement {
  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={error ? "payment-method-error" : undefined}
    >
      <legend className="mb-3 text-small font-medium">How will you pay?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((method) => {
          const checked = value === method.id;
          return (
            <label
              key={method.id}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-md border p-3 transition-colors duration-fast has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan-glow",
                checked ? "border-navy-900 bg-mist" : "border-line hover:border-navy-600/45",
              )}
            >
              <input
                type="radio"
                name="methodId"
                value={method.id}
                checked={checked}
                onChange={() => onChange(method.id)}
                className="sr-only"
              />
              <PaymentMethodLogo name={method.name} logoUrl={method.logoUrl} />
              <span className="flex-1 font-medium">{method.name}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "size-5 rounded-pill",
                  checked ? "border-[6px] border-navy-900" : "border-2 border-line",
                )}
              />
            </label>
          );
        })}
      </div>
      {error ? (
        <p id="payment-method-error" className="text-small text-error-text">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

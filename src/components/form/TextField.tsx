"use client";

import { useState, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

import { useFieldError } from "./useFieldError";

interface TextFieldProps extends Omit<ComponentProps<"input">, "name"> {
  name: string;
  label: string;
  hint?: ReactNode;
  optional?: boolean;
  fieldClassName?: string;
}

/** Formik-bound text input with label, hint and Yup error. Password fields get a show button. */
export function TextField({
  name,
  label,
  hint,
  optional,
  fieldClassName,
  type = "text",
  className,
  ...rest
}: TextFieldProps): ReactElement {
  const [field] = useField({ name, type });
  const error = useFieldError(name);
  const [shown, setShown] = useState(false);
  const secret = type === "password";
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={fieldClassName}>
      {(control) =>
        secret ? (
          <div className="relative">
            <Input
              {...control}
              {...field}
              value={field.value ?? ""}
              type={shown ? "text" : "password"}
              autoCapitalize="none"
              spellCheck={false}
              className={`pr-12 ${className ?? ""}`}
              {...rest}
            />
            <button
              type="button"
              onClick={() => setShown((value) => !value)}
              aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
              aria-pressed={shown}
              aria-controls={control.id}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-glow"
            >
              {shown ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        ) : (
          <Input
            {...control}
            {...field}
            value={field.value ?? ""}
            type={type}
            className={className}
            {...rest}
          />
        )
      }
    </Field>
  );
}

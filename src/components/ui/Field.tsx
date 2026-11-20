"use client";

import { useId, type ReactElement, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

export interface FieldControlProps {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  /** Render prop so the control gets the right id and aria wiring. */
  children: (control: FieldControlProps) => ReactNode;
}

/** Label + control + hint + error, wired for screen readers. */
export function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
}: FieldProps): ReactElement {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-soft">(optional)</span> : null}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint ? (
        <p id={hintId} className="text-small text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-small text-error-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

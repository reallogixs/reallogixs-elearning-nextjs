"use client";

import type { ReactElement } from "react";
import { useFormikContext } from "formik";

import { Alert } from "@/components/ui/Alert";

/**
 * Shows a server/API error stored with `setStatus("…")`. Validation errors come from
 * Yup per field; this is only for things like "email already in use".
 */
export function FormStatus({ className }: { className?: string }): ReactElement | null {
  const { status } = useFormikContext<object>();
  if (typeof status !== "string" || !status) return null;
  return (
    <Alert tone="danger" className={className}>
      {status}
    </Alert>
  );
}

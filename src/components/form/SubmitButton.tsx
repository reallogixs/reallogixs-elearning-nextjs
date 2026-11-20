"use client";

import type { ReactElement, ReactNode } from "react";
import { useFormikContext } from "formik";

import { Button, type ButtonVariant } from "@/components/ui/Button";

interface SubmitButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  className?: string;
}

export function SubmitButton({
  children,
  variant,
  size,
  arrow,
  className,
}: SubmitButtonProps): ReactElement {
  const { isSubmitting } = useFormikContext<object>();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      arrow={arrow}
      loading={isSubmitting}
      className={className}
    >
      {children}
    </Button>
  );
}

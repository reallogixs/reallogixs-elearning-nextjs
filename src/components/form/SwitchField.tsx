"use client";

import type { ReactElement } from "react";
import { useField } from "formik";

import { Switch } from "@/components/ui/Switch";

interface SwitchFieldProps {
  name: string;
  label: string;
  description?: string;
  className?: string;
}

export function SwitchField({
  name,
  label,
  description,
  className,
}: SwitchFieldProps): ReactElement {
  const [field] = useField({ name, type: "checkbox" });
  return <Switch {...field} label={label} description={description} className={className} />;
}

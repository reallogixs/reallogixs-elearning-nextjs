"use client";

import { useId, useState, type ReactElement } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { useField } from "formik";
import { ValidationError } from "yup";

import { readLogoFile } from "@/lib/files";
import { LOGO_TYPES, logoFileSchema } from "@/lib/validation/admin";
import { PaymentMethodLogo } from "@/components/payments/PaymentMethodLogo";
import { Button } from "@/components/ui/Button";

/** Uploads a logo into the `logoUrl` field. File rules come from `logoFileSchema` (Yup). */
export function LogoUploadField({
  name,
  methodName,
}: {
  name: string;
  methodName: string;
}): ReactElement {
  const id = useId();
  const [field, , helpers] = useField<string | null>(name);
  const [error, setError] = useState<string>();

  async function choose(file: File | undefined): Promise<void> {
    if (!file) return;
    try {
      await logoFileSchema.validate({ logo: file });
      setError(undefined);
      await helpers.setValue(await readLogoFile(file));
    } catch (problem) {
      setError(
        problem instanceof ValidationError ? problem.message : "We couldn't read that image.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-small font-medium">Logo</span>
      <div className="flex flex-wrap items-center gap-4">
        <PaymentMethodLogo name={methodName || "?"} logoUrl={field.value} className="size-16" />
        <label
          htmlFor={id}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-navy-900 px-4 text-small font-medium hover:bg-mist has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan-glow"
        >
          <ImageUp aria-hidden="true" className="size-4" />
          {field.value ? "Replace logo" : "Upload logo"}
          <input
            id={id}
            type="file"
            accept={LOGO_TYPES.join(",")}
            className="sr-only"
            aria-describedby={`${id}-hint`}
            onChange={(event) => {
              void choose(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {field.value ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="size-4" />}
            onClick={() => void helpers.setValue(null)}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <p id={`${id}-hint`} className="text-small text-ink-soft">
        PNG, JPG, WebP or SVG, under 512 KB. Square logos look best. Without one, the initials show.
      </p>
      {error ? (
        <p className="text-small text-error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

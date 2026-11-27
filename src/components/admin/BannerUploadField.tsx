"use client";

import { useId, useState, type ReactElement } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { useField } from "formik";
import { ValidationError } from "yup";

import { readBannerFile } from "@/lib/files";
import { BANNER_TYPES, bannerFileSchema } from "@/lib/validation/admin";
import { Button } from "@/components/ui/Button";

/** Course banner, shown on course cards and the course page. */
export function BannerUploadField({ name }: { name: string }): ReactElement {
  const id = useId();
  const [field, , helpers] = useField<string | null>(name);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function choose(file: File | undefined): Promise<void> {
    if (!file) return;
    setBusy(true);
    try {
      await bannerFileSchema.validate({ banner: file });
      setError(undefined);
      await helpers.setValue(await readBannerFile(file));
    } catch (problem) {
      setError(
        problem instanceof ValidationError ? problem.message : "We couldn't read that image.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-small font-medium">Banner image</span>
      <div className="relative aspect-[16/9] w-full max-w-xl overflow-hidden rounded-md border border-dashed border-line bg-mist">
        {field.value ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview or uploaded image.
          <img src={field.value} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center p-4 text-center text-small text-ink-soft">
            No banner: the course shows branded artwork instead.
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-navy-900 px-4 text-small font-medium hover:bg-mist has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan-glow"
        >
          <ImageUp aria-hidden="true" className="size-4" />
          {busy ? "Preparing…" : field.value ? "Replace banner" : "Upload banner"}
          <input
            id={id}
            type="file"
            accept={BANNER_TYPES.join(",")}
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
        JPG, PNG or WebP, landscape 16:9 works best (e.g. 1600 × 900). It is resized before upload.
      </p>
      {error ? (
        <p className="text-small text-error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

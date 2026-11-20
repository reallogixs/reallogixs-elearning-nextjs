"use client";

import { useId, useState, type DragEvent, type ReactElement } from "react";
import { FileCheck2, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/cn";

interface FileDropProps {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

/** Drag-and-drop or click-to-choose single file input. */
export function FileDrop({
  label,
  hint,
  accept,
  file,
  error,
  onChange,
}: FileDropProps): ReactElement {
  const id = useId();
  const [dragging, setDragging] = useState(false);

  function onDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setDragging(false);
    onChange(event.dataTransfer.files[0] ?? null);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-small font-medium text-ink">{label}</span>
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-mist px-4 py-3">
          <span className="flex min-w-0 items-center gap-2 text-small">
            <FileCheck2 aria-hidden="true" className="size-5 shrink-0 text-success-text" />
            <span className="truncate">{file.name}</span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex min-h-11 items-center gap-1 rounded-pill px-3 text-small text-ink-soft hover:bg-white"
          >
            <X aria-hidden="true" className="size-4" /> Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center gap-2 rounded-md border border-dashed px-6 py-10 text-center transition-colors duration-fast",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan-glow",
            dragging
              ? "border-sky-400 bg-sky-100"
              : error
                ? "border-error"
                : "border-line hover:bg-mist",
          )}
        >
          <UploadCloud aria-hidden="true" className="size-8 text-teal-600" />
          <span className="font-medium">
            Drop your receipt here or <span className="text-teal-700 underline">browse</span>
          </span>
          <span className="text-small text-ink-soft">{hint}</span>
          <input
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
        </label>
      )}
      {error ? (
        <p id={`${id}-error`} className="text-small text-error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

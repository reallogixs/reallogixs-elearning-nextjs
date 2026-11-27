import { cn } from "@/lib/cn";

/** Shared look for inputs, selects and textareas (DESIGN.md §5 form fields). */
export function fieldControlClass(invalid?: boolean): string {
  return cn(
    "block w-full rounded-sm border bg-white px-4 text-body text-ink outline-none",
    "transition-[border-color,box-shadow] duration-fast ease-standard",
    "placeholder:text-ink-soft/70 focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:border-dashed disabled:bg-line/40 disabled:text-ink-soft",
    // Read-only (e.g. a login email) looks locked too, but stays readable and selectable.
    "[&[readonly]]:cursor-default [&[readonly]]:border-dashed [&[readonly]]:bg-line/40 [&[readonly]]:text-ink-soft",
    invalid
      ? "border-error hover:border-error focus:border-error focus:field-ring-error"
      : "border-line hover:border-navy-600/45 focus:border-navy-600 focus:field-ring",
  );
}

import type { ReactElement } from "react";
import { X } from "lucide-react";

/** An applied filter; tapping it removes the filter. */
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-sky-100 py-1 pr-2 pl-3 text-small font-medium text-navy-900 hover:bg-sky-300/40"
    >
      {label}
      <X aria-hidden="true" className="size-3.5" />
      <span className="sr-only">(remove filter)</span>
    </button>
  );
}

"use client";

import { useEffect, useRef, type ReactElement, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

import { IconButton } from "./IconButton";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
}

const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" } as const;

/**
 * Native <dialog> modal: the browser handles the focus trap, Esc and returning
 * focus to the trigger.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: ModalProps): ReactElement {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
      className={cn("m-auto w-[calc(100%-2rem)] rounded-lg bg-white p-0 shadow-card", widths[size])}
    >
      {open ? (
        <div className="flex max-h-[85dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <h2 id="modal-title" className="text-h4">
                {title}
              </h2>
              {description ? <p className="mt-1 text-small text-ink-soft">{description}</p> : null}
            </div>
            <IconButton label="Close" onClick={onClose} className="-mt-2 -mr-2">
              <X className="size-5" />
            </IconButton>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <footer className="flex flex-wrap justify-end gap-3 border-t border-line px-6 py-4">
              {footer}
            </footer>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

"use client";

import { useEffect, useRef, type ReactElement, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

import { IconButton } from "./IconButton";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Which edge it slides in from. */
  side?: "left" | "right";
  /** Optional sticky footer (e.g. "Show 6 courses"). */
  footer?: ReactNode;
  /** Replace the default title bar (e.g. with the logo). */
  header?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Side panel on a native <dialog>: the browser traps focus, closes on Esc and returns
 * focus to the trigger. Used for every mobile menu and filter panel.
 */
export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  footer,
  header,
  className,
  children,
}: DrawerProps): ReactElement {
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
      aria-label={title}
      className={cn(
        "drawer fixed inset-y-0 m-0 h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none bg-white p-0 shadow-card",
        side === "left" ? "drawer-left right-auto left-0" : "drawer-right right-0 left-auto",
        className,
      )}
    >
      {open ? (
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line/80 pr-2 pl-5">
            {header ?? <h2 className="text-h4">{title}</h2>}
            <IconButton label={`Close ${title.toLowerCase()}`} onClick={onClose} autoFocus>
              <X className="size-5" />
            </IconButton>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer ? <div className="shrink-0 border-t border-line/80 p-4">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

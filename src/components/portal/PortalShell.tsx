"use client";

import { useState, type ReactElement, type ReactNode } from "react";

import type { Role } from "@/types/domain";

import { Modal } from "@/components/ui/Modal";

import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";
import { RequireRole } from "./RequireRole";

/** Layout for every portal: light sidebar on desktop, top bar with menu on mobile. */
export function PortalShell({ role, children }: { role: Role; children: ReactNode }): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <RequireRole role={role}>
      <div className="portal-theme min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-[264px_1fr]">
        <aside className="sticky top-0 hidden h-dvh border-r border-line/80 bg-white lg:block">
          <PortalSidebar role={role} />
        </aside>
        <div className="flex min-w-0 flex-col">
          <PortalTopbar role={role} onOpenMenu={() => setOpen(true)} menuOpen={open} />
          <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
        <Modal open={open} onClose={() => setOpen(false)} title="Menu" size="sm">
          <div className="portal-theme -mx-6 -my-5">
            <PortalSidebar role={role} onNavigate={() => setOpen(false)} />
          </div>
        </Modal>
      </div>
    </RequireRole>
  );
}

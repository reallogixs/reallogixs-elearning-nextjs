"use client";

import { Suspense, useState, type ReactElement, type ReactNode } from "react";

import type { Account } from "@/types/account";
import { AccountProvider } from "@/lib/account/AccountContext";
import { useHydrated } from "@/lib/useHydrated";
import { BrandMark } from "@/components/brand/BrandMark";
import { Drawer } from "@/components/ui/Drawer";

import { PORTAL_TITLE } from "./navConfig";

import { PortalLoading } from "./PortalLoading";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";

interface PortalShellProps {
  /** Checked on the server by the layout. */
  account: Account;
  /** Admins: receipts awaiting verification. */
  pending?: Promise<number>;
  children: ReactNode;
}

/** Layout for every portal: light sidebar on desktop, the same sidebar in a drawer on mobile. */
export function PortalShell({ account, pending, children }: PortalShellProps): ReactElement {
  const { role } = account;
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  return (
    <AccountProvider account={account}>
      <div className="portal-theme min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-[264px_1fr]">
        <aside className="sticky top-0 hidden h-dvh border-r border-line/80 bg-white lg:block">
          <PortalSidebar role={role} pending={pending} />
        </aside>
        <div className="flex min-w-0 flex-col">
          <PortalTopbar
            role={role}
            pending={pending}
            onOpenMenu={() => setOpen(true)}
            menuOpen={open}
          />
          <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              {hydrated ? (
                <Suspense fallback={<PortalLoading />}>{children}</Suspense>
              ) : (
                <PortalLoading />
              )}
            </div>
          </main>
        </div>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Menu"
          side="left"
          header={<BrandMark tag={PORTAL_TITLE[role]} href={`/${role}`} />}
        >
          <div className="portal-theme h-full">
            <PortalSidebar
              role={role}
              pending={pending}
              onNavigate={() => setOpen(false)}
              showBrand={false}
            />
          </div>
        </Drawer>
      </div>
    </AccountProvider>
  );
}

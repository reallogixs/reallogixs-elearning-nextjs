"use client";

import { useEffect, type ReactElement, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import type { Role } from "@/types/domain";
import { useCurrentUser, useHydrated } from "@/lib/store/hooks";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PORTAL_HOME } from "@/components/site/navigation";

/**
 * MOCK GUARD: client-side only. With Supabase this moves to `proxy.ts` / server
 * checks plus row-level security, which is what actually protects the data.
 * Signed-out visitors go to login; someone signed in with another role is pointed
 * to their own portal (redirecting them would fight an in-flight navigation).
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }): ReactElement {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, router, pathname]);

  if (hydrated && user && user.role !== role) {
    return (
      <main id="main" className="flex min-h-dvh items-center justify-center p-6">
        <EmptyState
          icon={<ShieldAlert className="size-5" />}
          title="This portal isn't for your account"
          body={`You're signed in as ${user.name} (${user.role}).`}
          action={
            <Button href={PORTAL_HOME[user.role]} size="sm" arrow>
              Go to my portal
            </Button>
          }
        />
      </main>
    );
  }

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6" aria-busy="true">
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }
  return <>{children}</>;
}

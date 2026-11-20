"use client";

import type { ReactElement } from "react";
import { UserRound } from "lucide-react";

import { useCurrentUser } from "@/lib/store/hooks";
import { Button } from "@/components/ui/Button";

import { PORTAL_HOME } from "./navigation";

/** "Log in" for visitors, "My portal" once signed in. */
export function AccountLink({ className }: { className?: string }): ReactElement {
  const user = useCurrentUser();
  return (
    <Button
      href={user ? PORTAL_HOME[user.role] : "/login"}
      variant="secondary"
      size="sm"
      icon={<UserRound className="size-4" />}
      className={className}
    >
      {user ? "My portal" : "Log in"}
    </Button>
  );
}

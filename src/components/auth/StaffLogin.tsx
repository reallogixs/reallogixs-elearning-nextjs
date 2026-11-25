import type { ReactElement } from "react";

import type { Role } from "@/types/domain";
import { BrandMark } from "@/components/brand/BrandMark";
import { PORTAL_TITLE } from "@/components/portal/navConfig";
import { Card } from "@/components/ui/Card";

import { LoginForm } from "./LoginForm";

/** Admin and teacher logins: on their own, away from the public site's menus. */
export function StaffLogin({
  role,
  next,
}: {
  role: Exclude<Role, "student">;
  next: string | null;
}): ReactElement {
  return (
    <main
      id="main"
      className="portal-theme flex min-h-dvh flex-col items-center justify-center gap-8 bg-canvas p-4 text-ink"
    >
      <BrandMark tag={PORTAL_TITLE[role]} href="/" />
      <Card className="flex w-full max-w-md flex-col gap-6 p-6 sm:p-8">
        <h1 className="text-dash-title">{PORTAL_TITLE[role]} log in</h1>
        <LoginForm role={role} next={next} />
      </Card>
    </main>
  );
}

"use client";

import type { ReactElement } from "react";

import { useCurrentUser } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";

import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileForm } from "./ProfileForm";

/** Settings page shared by the student and teacher portals. */
export function AccountSettings(): ReactElement | null {
  const user = useCurrentUser();
  if (!user) return null;
  return (
    <>
      <PageHeader title="Settings" description="Update your details and password." />
      <ProfileForm user={user} />
      <ChangePasswordForm userId={user.id} />
    </>
  );
}

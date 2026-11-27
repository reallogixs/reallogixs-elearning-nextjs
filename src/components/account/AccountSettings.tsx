"use client";

import type { ReactElement } from "react";

import { useCurrentUser } from "@/lib/account/useCurrentUser";
import { PageHeader } from "@/components/portal/PageHeader";

import { ChangeEmailForm } from "./ChangeEmailForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileForm } from "./ProfileForm";

/** Settings page shared by the portals. */
export function AccountSettings(): ReactElement | null {
  const user = useCurrentUser();
  if (!user) return null;
  return (
    <>
      <PageHeader title="Settings" description="Update your details, login email and password." />
      <ProfileForm user={user} />
      {user.role === "teacher" ? null : <ChangeEmailForm />}
      <ChangePasswordForm />
    </>
  );
}

import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { PasswordCard } from "@/components/auth/PasswordCard";

export const metadata = buildMetadata({
  title: "Forgot password",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage(): ReactElement {
  return (
    <PasswordCard
      title="Forgot your password?"
      body="Enter your email and we'll send a link to choose a new one."
    >
      <ForgotPasswordForm />
    </PasswordCard>
  );
}

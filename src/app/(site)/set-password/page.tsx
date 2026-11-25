import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { PasswordCard } from "@/components/auth/PasswordCard";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

/** No referrer: the address holds a one-time secret. */
export const metadata = {
  ...buildMetadata({ title: "Choose a password", path: "/set-password", noIndex: true }),
  referrer: "no-referrer" as const,
};

export default function SetPasswordPage(): ReactElement {
  return (
    <PasswordCard title="Choose a password" body="You'll be logged in straight after.">
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </PasswordCard>
  );
}

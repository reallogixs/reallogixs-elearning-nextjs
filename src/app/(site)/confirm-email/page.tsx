import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { ConfirmEmailForm } from "@/components/auth/ConfirmEmailForm";
import { PasswordCard } from "@/components/auth/PasswordCard";
import { Alert } from "@/components/ui/Alert";

/** No referrer: the address holds a one-time secret. */
export const metadata = {
  ...buildMetadata({ title: "Confirm email", path: "/confirm-email", noIndex: true }),
  referrer: "no-referrer" as const,
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}): Promise<ReactElement> {
  const token = [(await searchParams).token].flat()[0] ?? "";
  return (
    <PasswordCard
      title="Confirm your new email"
      body="You'll be signed out everywhere, then log in with the new email."
    >
      {token ? (
        <ConfirmEmailForm token={token} />
      ) : (
        <Alert tone="warning">This link isn&apos;t complete. Open it again from your email.</Alert>
      )}
    </PasswordCard>
  );
}

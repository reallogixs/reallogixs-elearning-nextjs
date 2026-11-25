import type { ReactElement, ReactNode } from "react";

import { AuthCard } from "./AuthCard";

/** Layout for the password pages. */
export function PasswordCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}): ReactElement {
  return (
    <AuthCard
      label="Your account"
      title={title}
      body={body}
      aside={<p className="font-display text-h2 text-white">Only you know your password.</p>}
    >
      {children}
    </AuthCard>
  );
}

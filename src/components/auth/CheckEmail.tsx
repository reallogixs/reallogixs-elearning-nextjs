import type { ReactElement } from "react";
import { MailCheck } from "lucide-react";

/** Worded the same whether or not the email has an account. */
export function CheckEmail({ email, body }: { email: string; body: string }): ReactElement {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-md border border-line bg-mist p-6">
      <MailCheck aria-hidden="true" className="size-7 text-teal-600" />
      <h2 className="text-h4">Check your email</h2>
      <p className="text-ink-soft">
        If <span className="font-medium break-all text-ink">{email}</span> can be used, an email is
        on its way. {body}
      </p>
    </div>
  );
}

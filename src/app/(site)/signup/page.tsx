import type { ReactElement } from "react";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = buildMetadata({
  title: "Create student account",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage(): ReactElement {
  return (
    <AuthCard
      label="Student account"
      title="Keep your learning in one place"
      body={
        <>
          An account is optional. It lets you see every enrolment, receipt and certificate together.
          Any earlier orders made with the same email or phone are added automatically. Already have
          one?{" "}
          <Link href="/login" className="text-teal-700 underline">
            Log in
          </Link>
          .
        </>
      }
      aside={
        <>
          <p className="font-display text-h2 text-white">
            Your history, receipts and certificates.
          </p>
          <p>
            Re-upload a receipt, find your WhatsApp community link and download certificates any
            time.
          </p>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}

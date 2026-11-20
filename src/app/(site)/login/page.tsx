import { Suspense, type ReactElement } from "react";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = buildMetadata({ title: "Log in", path: "/login", noIndex: true });

export default function LoginPage(): ReactElement {
  return (
    <AuthCard
      label="Welcome back"
      title="Log in"
      body={
        <>
          Students, teachers and admins all log in here. New student?{" "}
          <Link href="/signup" className="text-teal-700 underline">
            Create an account
          </Link>
          . Teacher accounts are created by the Reallogixs team.
        </>
      }
      aside={
        <>
          <p className="font-display text-h2 text-white">One login, three portals.</p>
          <p>
            Students see their courses and receipts. Teachers see referrals and earnings. Admins run
            the academy.
          </p>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

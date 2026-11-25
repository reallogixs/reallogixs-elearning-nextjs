import type { ReactElement } from "react";

import { safeNext } from "@/lib/account/loginPath";
import { buildMetadata } from "@/lib/seo";
import { ContentAuthCard } from "@/components/auth/ContentAuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { redirectIfSignedIn } from "@/server/core/page";

export const metadata = buildMetadata({ title: "Log in", path: "/login", noIndex: true });

/** Students only. Admins and teachers have their own logins. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}): Promise<ReactElement> {
  await redirectIfSignedIn("student");
  const { next } = await searchParams;
  return (
    <ContentAuthCard page="login">
      <LoginForm role="student" next={safeNext("student", [next].flat()[0])} />
    </ContentAuthCard>
  );
}

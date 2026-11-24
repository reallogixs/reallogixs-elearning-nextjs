import { Suspense, type ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { ContentAuthCard } from "@/components/auth/ContentAuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = buildMetadata({ title: "Log in", path: "/login", noIndex: true });

export default function LoginPage(): ReactElement {
  return (
    <ContentAuthCard page="login">
      <Suspense>
        <LoginForm />
      </Suspense>
    </ContentAuthCard>
  );
}

import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { ContentAuthCard } from "@/components/auth/ContentAuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = buildMetadata({
  title: "Create student account",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage(): ReactElement {
  return (
    <ContentAuthCard page="signup">
      <SignupForm />
    </ContentAuthCard>
  );
}

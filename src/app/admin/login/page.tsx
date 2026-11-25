import type { ReactElement } from "react";

import { safeNext } from "@/lib/account/loginPath";
import { buildMetadata } from "@/lib/seo";
import { StaffLogin } from "@/components/auth/StaffLogin";
import { redirectIfSignedIn } from "@/server/core/page";

export const metadata = buildMetadata({
  title: "Admin log in",
  path: "/admin/login",
  noIndex: true,
});

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}): Promise<ReactElement> {
  await redirectIfSignedIn("admin");
  const { next } = await searchParams;
  return <StaffLogin role="admin" next={safeNext("admin", [next].flat()[0])} />;
}

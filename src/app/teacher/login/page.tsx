import type { ReactElement } from "react";

import { safeNext } from "@/lib/account/loginPath";
import { buildMetadata } from "@/lib/seo";
import { StaffLogin } from "@/components/auth/StaffLogin";
import { redirectIfSignedIn } from "@/server/core/page";

export const metadata = buildMetadata({
  title: "Teacher log in",
  path: "/teacher/login",
  noIndex: true,
});

export default async function TeacherLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}): Promise<ReactElement> {
  await redirectIfSignedIn("teacher");
  const { next } = await searchParams;
  return <StaffLogin role="teacher" next={safeNext("teacher", [next].flat()[0])} />;
}

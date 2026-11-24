import type { ReactElement } from "react";

import { buildMetadata } from "@/lib/seo";
import { JoinClass } from "@/components/join/JoinClass";

export const metadata = buildMetadata({ title: "Join class", path: "/join", noIndex: true });

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<ReactElement> {
  const { token } = await params;
  return <JoinClass token={token} />;
}

import type { ReactElement } from "react";

import { ADMISSION_MESSAGE } from "@/lib/domain/meeting";
import { buildMetadata } from "@/lib/seo";
import { JoinClass } from "@/components/join/JoinClass";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { getJoinInfo } from "@/server/queries/classes";

export const metadata = buildMetadata({ title: "Join class", path: "/join", noIndex: true });

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<ReactElement> {
  const { token } = await params;
  const info = await getJoinInfo(token);
  if (!info)
    return (
      <NotFoundState
        title="This join link doesn't work"
        body={ADMISSION_MESSAGE.invalid_link}
        href="/track"
        cta="Find my order"
      />
    );
  return <JoinClass token={token} info={info} />;
}

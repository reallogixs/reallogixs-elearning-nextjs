"use client";

import { Suspense, use, type ReactElement, type ReactNode } from "react";

interface PendingCountProps {
  /** Receipts awaiting verification; arrives with the rest of the data. */
  count: Promise<number> | undefined;
  children: (count: number) => ReactNode;
}

function Resolved({
  count,
  children,
}: {
  count: Promise<number>;
  children: PendingCountProps["children"];
}): ReactElement {
  return <>{children(use(count))}</>;
}

/** Shows zero until the number is in, so the menu never waits for it. */
export function PendingCount({ count, children }: PendingCountProps): ReactElement {
  if (!count) return <>{children(0)}</>;
  return (
    <Suspense fallback={children(0)}>
      <Resolved count={count}>{children}</Resolved>
    </Suspense>
  );
}

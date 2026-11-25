"use client";

import type { ReactElement } from "react";
import { CloudOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/** Shown if a page can't load, e.g. the database can't be reached. */
export default function ErrorPage({ reset }: { reset: () => void }): ReactElement {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon={<CloudOff className="size-5" />}
        title="We couldn't load this page"
        body="Please try again in a moment."
        action={
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}

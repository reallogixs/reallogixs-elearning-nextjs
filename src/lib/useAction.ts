"use client";

import { useCallback, useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Result } from "@/types/forms";
import { startLoading, stopLoading } from "@/lib/loadingBar";
import { useToast } from "@/components/ui/Toast";

interface ActionApi {
  /** Key of the action currently running, so only its button shows a spinner. */
  pending: string | null;
  run: <T>(
    key: string,
    action: () => Promise<Result<T>>,
    successMessage?: string,
  ) => Promise<Result<T>>;
}

/** Runs an action with a loading key and a toast, then reloads the page's server data. */
export function useAction(): ActionApi {
  const { notify } = useToast();
  const router = useRouter();
  const key = useId();
  const [refreshing, startRefresh] = useTransition();
  const [pending, setPending] = useState<string | null>(null);

  const busy = pending !== null || refreshing;
  useEffect(() => {
    if (!busy) return;
    startLoading(key);
    return () => stopLoading(key);
  }, [busy, key]);

  const run = useCallback(
    async <T>(
      name: string,
      action: () => Promise<Result<T>>,
      successMessage?: string,
    ): Promise<Result<T>> => {
      setPending(name);
      try {
        const result = await action();
        if (!result.ok) notify(result.error, "error");
        else {
          if (successMessage) notify(successMessage);
          startRefresh(() => router.refresh());
        }
        return result;
      } catch {
        const error = "We couldn't reach the server. Check your connection and try again.";
        notify(error, "error");
        return { ok: false, error };
      } finally {
        setPending(null);
      }
    },
    [notify, router],
  );

  return { pending, run };
}

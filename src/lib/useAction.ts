"use client";

import { useCallback, useState } from "react";

import type { Result } from "@/types/forms";
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

/** Runs a mock-API mutation with a loading key and a success/error toast. */
export function useAction(): ActionApi {
  const { notify } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const run = useCallback(
    async <T>(
      key: string,
      action: () => Promise<Result<T>>,
      successMessage?: string,
    ): Promise<Result<T>> => {
      setPending(key);
      try {
        const result = await action();
        if (!result.ok) notify(result.error, "error");
        else if (successMessage) notify(successMessage);
        return result;
      } finally {
        setPending(null);
      }
    },
    [notify],
  );

  return { pending, run };
}

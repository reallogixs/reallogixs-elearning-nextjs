"use client";

import { useEffect, useState, useSyncExternalStore, type ReactElement } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { loadingStore, PAGE, startLoading, stopLoading } from "@/lib/loadingBar";

/** In case a page never arrives, e.g. the connection dropped. */
const GIVE_UP_MS = 20_000;
const FADE_MS = 400;
const NOTHING: ReadonlySet<string> = new Set();

/** True for a plain click on a link that opens another page of this site in this tab. */
function leadsToPage(event: MouseEvent): boolean {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false;
  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (!link?.href || link.hasAttribute("download") || link.dataset.file !== undefined) return false;
  if (link.target && link.target !== "_self") return false;
  const { origin, pathname, search } = new URL(link.href, window.location.href);
  const here = window.location;
  return origin === here.origin && pathname + search !== here.pathname + here.search;
}

/** Thin bar at the top of the screen while the next page, or fresh data, is on its way. */
export function LoadingBar(): ReactElement {
  const waiting = useSyncExternalStore(loadingStore.subscribe, loadingStore.get, () => NOTHING);
  const active = waiting.size > 0;
  const [fading, setFading] = useState(false);
  const [wasActive, setWasActive] = useState(false);
  if (active !== wasActive) {
    setWasActive(active);
    setFading(!active);
  }
  const address = `${usePathname()}?${useSearchParams().toString()}`;

  // The address only changes once the new page is ready.
  useEffect(() => stopLoading(PAGE), [address]);

  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      if (leadsToPage(event)) startLoading(PAGE);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => loadingStore.set(() => NOTHING), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => setFading(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [fading]);

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-hidden={!active}
      className={cn(
        "loading-bar pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-logic",
        active ? "loading-bar-active" : fading ? "loading-bar-done" : "opacity-0",
      )}
    />
  );
}

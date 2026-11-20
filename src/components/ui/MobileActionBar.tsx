import type { ReactElement, ReactNode } from "react";

/**
 * Sticky bottom bar for the page's main action on phones and tablets (e.g. Enrol).
 * Renders a spacer so the footer is never hidden underneath it.
 */
export function MobileActionBar({ children }: { children: ReactNode }): ReactElement {
  return (
    <>
      <div aria-hidden="true" className="h-24 lg:hidden" />
      <div
        data-action-bar
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-line/80 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-card backdrop-blur-md lg:hidden"
      >
        {children}
      </div>
    </>
  );
}

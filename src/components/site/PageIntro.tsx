import type { ReactElement, ReactNode } from "react";

import { SectionLabel } from "@/components/ui/SectionLabel";

interface PageIntroProps {
  label: string;
  title: string;
  body?: ReactNode;
  children?: ReactNode;
}

/** Top-of-page heading block used by every public page. */
export function PageIntro({ label, title, body, children }: PageIntroProps): ReactElement {
  return (
    <section className="relative overflow-hidden border-b border-line/60 bg-gradient-soft">
      <div aria-hidden="true" className="absolute inset-0 bg-grid" />
      <div className="rl-stagger relative shell flex flex-col gap-4 py-12 lg:py-16">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="max-w-3xl text-h1">{title}</h1>
        {body ? <p className="max-w-2xl text-body-lg text-ink-soft">{body}</p> : null}
        {children}
      </div>
    </section>
  );
}

import type { ReactElement, ReactNode } from "react";

import { CircuitLine } from "@/components/brand/CircuitLine";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface AuthCardProps {
  label: string;
  title: string;
  body?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}

/** Split layout for login and signup: form on the left, brand panel on the right. */
export function AuthCard({ label, title, body, children, aside }: AuthCardProps): ReactElement {
  return (
    <section className="shell grid gap-10 py-12 lg:grid-cols-2 lg:py-20">
      <div className="flex max-w-lg flex-col gap-6">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="text-h1">{title}</h1>
        {body ? <p className="text-ink-soft">{body}</p> : null}
        {children}
      </div>
      <div className="on-dark relative hidden overflow-hidden rounded-lg bg-gradient-deep p-10 text-on-dark lg:flex lg:flex-col lg:justify-end">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-glow" />
        <div className="relative flex flex-col gap-6">{aside}</div>
        <CircuitLine className="relative mt-10 opacity-60" />
      </div>
    </section>
  );
}

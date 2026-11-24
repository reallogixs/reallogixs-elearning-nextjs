import type { ReactElement, ReactNode } from "react";

import type { SectionCopy } from "@/types/domain";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ContentHeadingProps {
  id: string;
  copy: SectionCopy;
  tone?: "light" | "dark";
  action?: ReactNode;
}

/** A home section heading built from admin-managed copy (Admin → Site content → Home). */
export function ContentHeading({
  id,
  copy,
  tone = "light",
  action,
}: ContentHeadingProps): ReactElement {
  return (
    <SectionHeading
      id={id}
      tone={tone}
      label={copy.label}
      title={
        <>
          {copy.title}
          {copy.highlight ? (
            <span className={tone === "dark" ? "text-gradient-light" : "text-gradient"}>
              {" "}
              {copy.highlight}
            </span>
          ) : null}
        </>
      }
      description={copy.description || undefined}
      action={action}
    />
  );
}

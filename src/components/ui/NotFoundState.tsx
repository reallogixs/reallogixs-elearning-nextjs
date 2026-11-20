import type { ReactElement } from "react";
import { SearchX } from "lucide-react";

import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

export function NotFoundState({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}): ReactElement {
  return (
    <div className="shell py-section">
      <EmptyState
        icon={<SearchX className="size-5" />}
        title={title}
        body={body}
        action={
          <Button href={href} size="sm" arrow>
            {cta}
          </Button>
        }
      />
    </div>
  );
}

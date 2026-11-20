import type { ReactElement, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Portal page title row with optional actions on the right. */
export function PageHeader({ title, description, actions }: PageHeaderProps): ReactElement {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-dash-title text-ink">{title}</h1>
        {description ? <p className="text-small text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

import type { ReactElement, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

type AlertTone = "info" | "success" | "warning" | "danger";

const styles: Record<AlertTone, { box: string; Icon: typeof Info }> = {
  info: { box: "border-sky-300/60 bg-sky-100 text-teal-700", Icon: Info },
  success: { box: "border-success/30 bg-success/10 text-success-text", Icon: CircleCheck },
  warning: { box: "border-warning/40 bg-warning/10 text-warning-text", Icon: TriangleAlert },
  danger: { box: "border-error/30 bg-error/10 text-error-text", Icon: CircleAlert },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps): ReactElement {
  const { box, Icon } = styles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-md border p-4 text-small", box, className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="text-ink">{children}</div> : null}
      </div>
    </div>
  );
}

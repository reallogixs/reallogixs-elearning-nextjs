import type { ReactElement } from "react";

import { cn } from "@/lib/cn";
import { initials } from "@/lib/domain/format";

interface PaymentMethodLogoProps {
  name: string;
  logoUrl: string | null;
  className?: string;
}

/** The admin-uploaded logo, or the method's initials until one is uploaded. Decorative. */
export function PaymentMethodLogo({
  name,
  logoUrl,
  className,
}: PaymentMethodLogoProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-white font-mono text-small font-medium text-teal-700",
        className,
      )}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded data URL / Cloudinary URL.
        <img src={logoUrl} alt="" className="size-full object-contain p-1" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

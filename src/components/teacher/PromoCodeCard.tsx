import type { ReactElement } from "react";
import { BadgePercent, HandCoins } from "lucide-react";

import type { TeacherUser } from "@/types/domain";
import { cn } from "@/lib/cn";
import { CopyButton } from "@/components/ui/CopyButton";

/** The teacher's referral code and rates, on the brand mesh. */
export function PromoCodeCard({
  teacher,
  className,
}: {
  teacher: TeacherUser;
  className?: string;
}): ReactElement {
  return (
    <section
      aria-label="Your promo code"
      className={cn(
        "on-dark relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-md bg-mesh p-6 text-white",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark" />
      <div className="flex flex-col gap-2">
        <p className="text-small font-medium text-on-dark">Your promo code</p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-h2 font-medium tracking-wide">{teacher.promoCode}</p>
          <CopyButton
            value={teacher.promoCode}
            className="bg-white text-navy-900 hover:bg-sky-100"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-small">
        <span className="inline-flex items-center gap-2 rounded-pill glass px-3 py-1.5">
          <HandCoins aria-hidden="true" className="size-4 text-sky-300" />
          You earn <strong>{teacher.commissionPct}%</strong> per enrolment
        </span>
        <span className="inline-flex items-center gap-2 rounded-pill glass px-3 py-1.5">
          <BadgePercent aria-hidden="true" className="size-4 text-sky-300" />
          {teacher.discountPct > 0 ? (
            <>
              Students save <strong>{teacher.discountPct}%</strong>
            </>
          ) : (
            "No student discount"
          )}
        </span>
      </div>
    </section>
  );
}

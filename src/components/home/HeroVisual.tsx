"use client";

import type { ReactElement } from "react";
import { CalendarDays, MessageCircle, ShieldCheck, Users } from "lucide-react";

import type { Course } from "@/types/domain";
import { formatDate, formatPKR } from "@/lib/domain/format";
import { seatsLeft } from "@/lib/domain/orders";
import { useDb } from "@/lib/store/hooks";
import { instructorById } from "@/lib/store/selectors";
import { CircuitLine } from "@/components/brand/CircuitLine";
import { MODE_LABEL } from "@/components/courses/courseLabels";

/** Decorative preview of the next featured batch on the brand mesh. Mirrors live data. */
export function HeroVisual({ course }: { course: Course }): ReactElement {
  const db = useDb();
  const instructor = instructorById(db, course.instructorId);
  const left = seatsLeft(course, db.orders);

  return (
    <div
      aria-hidden="true"
      className="on-dark relative isolate flex flex-col gap-4 overflow-hidden rounded-lg bg-mesh p-5 sm:p-8 lg:min-h-[34rem] lg:justify-center"
    >
      <div className="absolute inset-0 -z-10 bg-grid-dark" />
      <CircuitLine className="absolute right-0 bottom-16 left-0 -z-10 opacity-40" />

      <div className="flex items-center gap-2 self-end rounded-pill glass-light px-4 py-2 text-small font-medium text-ink">
        <MessageCircle className="size-4 text-success-text" />
        WhatsApp community
      </div>

      <div className="flex flex-col gap-5 rounded-md glass p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-pill bg-white/10 px-3 py-1 font-mono text-label uppercase">
            {MODE_LABEL[course.mode]}
          </span>
          <span className="font-mono text-label text-sky-300 uppercase">Next batch</span>
        </div>
        <p className="font-display text-h3 leading-tight">{course.title}</p>
        <div className="flex flex-col gap-2 text-small text-on-dark">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-sky-300" />
            Starts {formatDate(course.startDate)}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-sky-300" />
            {left} seats left{instructor ? ` · with ${instructor.name}` : ""}
          </span>
        </div>
        <div className="flex items-end justify-between border-t border-white/15 pt-4">
          <span className="font-display text-h3 font-semibold">{formatPKR(course.price)}</span>
          <span className="rounded-pill bg-white px-4 py-2 text-small font-medium text-navy-900">
            Enrol
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start rounded-md glass-light px-4 py-3 text-ink">
        <span className="flex size-9 items-center justify-center rounded-pill bg-success/15 text-success-text">
          <ShieldCheck className="size-5" />
        </span>
        <span className="text-small">
          <span className="block font-medium">Payment verified</span>
          <span className="text-ink-soft">usually within hours</span>
        </span>
      </div>
    </div>
  );
}

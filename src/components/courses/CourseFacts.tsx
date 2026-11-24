import type { ReactElement } from "react";
import { CalendarDays, Clock, Gauge, MapPin, MonitorPlay, Timer } from "lucide-react";

import type { Course } from "@/types/domain";
import { formatClassTime, formatDate, formatDuration } from "@/lib/domain/format";

import { LEVEL_LABEL, MODE_LABEL } from "./courseLabels";

/** Definition list of the practical details of a course. */
export function CourseFacts({ course }: { course: Course }): ReactElement {
  const facts = [
    {
      icon: course.mode === "online" ? MonitorPlay : MapPin,
      term: MODE_LABEL[course.mode],
      detail: course.venue,
    },
    { icon: CalendarDays, term: "Date", detail: formatDate(course.startsAt) },
    { icon: Clock, term: "Time", detail: formatClassTime(course.startsAt, course.durationMinutes) },
    { icon: Timer, term: "Duration", detail: formatDuration(course.durationMinutes) },
    { icon: Gauge, term: "Level", detail: LEVEL_LABEL[course.level] },
  ];
  return (
    <dl className="flex flex-col divide-y divide-line">
      {facts.map(({ icon: Icon, term, detail }) => (
        <div key={term} className="flex items-start gap-3 py-3">
          <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-600" />
          <div>
            <dt className="text-small font-medium">{term}</dt>
            <dd className="text-small text-ink-soft">{detail}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

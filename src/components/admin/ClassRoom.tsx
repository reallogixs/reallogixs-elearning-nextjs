"use client";

import type { ReactElement } from "react";
import { Award, Users, Video } from "lucide-react";

import { formatClassTime, formatDate, formatDateTime } from "@/lib/domain/format";
import { eligibleOrders, isInMeeting } from "@/lib/domain/meeting";
import { courseById, meetingFor } from "@/lib/portal/selectors";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { formatZoomId } from "@/lib/zoom/client";
import { usePortalData } from "@/components/data/PortalData";
import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { DashCard } from "@/components/portal/DashCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

import { ClassControls } from "./ClassControls";
import { ClassRoster } from "./ClassRoster";

export function ClassRoom({ courseId }: { courseId: string }): ReactElement {
  const db = usePortalData();
  const course = courseById(db, courseId);
  const meeting = meetingFor(db, courseId);
  // Students arrive and leave on their own while the class is live.
  useAutoRefresh(meeting?.status === "live");
  if (!course || !meeting) return <EmptyState title="Class not found" />;
  const inside = meeting.registrants.filter((row) => isInMeeting(meeting, row.orderId)).length;

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Classes", href: "/admin/classes" }, { label: course.title }]}
      />
      <PageHeader
        title={course.title}
        description={`${formatDate(course.startsAt)}, ${formatClassTime(course.startsAt, course.durationMinutes)}`}
        actions={<ClassControls meeting={meeting} />}
      />
      <div className="flex flex-wrap items-center gap-3 text-small text-ink-soft">
        <ClassStatusBadge meeting={meeting} />
        <span>
          Zoom ID <span className="font-mono text-ink">{formatZoomId(meeting.zoomId)}</span>
        </span>
        {meeting.startedAt ? <span>Started {formatDateTime(meeting.startedAt)}</span> : null}
        {meeting.endedAt ? <span>Ended {formatDateTime(meeting.endedAt)}</span> : null}
      </div>
      <Alert tone="info" title="Simulated Zoom">
        Start and end stand in for the host&apos;s Zoom controls. Use the link icon beside a student
        to open their join page and try getting in with the right or wrong Zoom email.
      </Alert>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Registered" value={meeting.registrants.length} icon={<Users />} />
        <StatCard label="In class now" value={inside} icon={<Video />} />
        <StatCard
          label={meeting.completedAt ? "Earned a certificate" : "Will get a certificate"}
          value={eligibleOrders(meeting, db.orders).length}
          icon={<Award />}
          hint="Joined after the class started"
        />
      </div>
      <h2 className="text-dash-heading">Students allowed in</h2>
      <ClassRoster meeting={meeting} />
      {meeting.denied.length ? (
        <DashCard title="Turned away" description="People Zoom refused at the door">
          <ul className="flex flex-col divide-y divide-line">
            {meeting.denied.map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="flex flex-col gap-0.5 py-3 text-small">
                <span className="font-semibold break-all">{entry.email}</span>
                <span className="text-ink-soft">
                  {entry.reason} · {formatDateTime(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        </DashCard>
      ) : null}
    </>
  );
}

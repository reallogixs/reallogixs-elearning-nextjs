"use client";

import type { ReactElement } from "react";
import Link from "next/link";

import { formatClassTime, formatDate } from "@/lib/domain/format";
import { eligibleOrders } from "@/lib/domain/meeting";
import { useDb } from "@/lib/store/hooks";
import { meetingFor } from "@/lib/store/selectors";
import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { PageHeader } from "@/components/portal/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";

/** Every course's Zoom class, soonest first; past ones at the end. */
export function ClassesAdmin(): ReactElement {
  const db = useDb();
  const rows = db.courses
    .flatMap((course) => {
      const meeting = meetingFor(db, course.id);
      return meeting ? [{ course, meeting }] : [];
    })
    .sort(
      (a, b) =>
        Number(Boolean(a.meeting.completedAt)) - Number(Boolean(b.meeting.completedAt)) ||
        a.course.startsAt.localeCompare(b.course.startsAt),
    );

  return (
    <>
      <PageHeader
        title="Classes"
        description="Each course has its own Zoom meeting. Open a class to host it, see attendance and mark it completed."
      />
      <DataTable
        caption="Zoom classes"
        rows={rows}
        rowKey={(row) => row.course.id}
        empty={
          <EmptyState title="No classes yet" body="Add a course to create its Zoom meeting." />
        }
        columns={[
          {
            key: "course",
            header: "Class",
            wrap: true,
            cell: ({ course }) => (
              <Link
                href={`/admin/classes/${course.id}`}
                className="inline-flex min-h-11 items-center font-semibold hover:text-teal-700 hover:underline"
              >
                {course.title}
              </Link>
            ),
          },
          {
            key: "when",
            header: "When",
            wrap: true,
            cell: ({ course }) =>
              `${formatDate(course.startsAt)}, ${formatClassTime(course.startsAt, course.durationMinutes)}`,
          },
          {
            key: "registered",
            header: "Registered",
            cell: ({ meeting }) => meeting.registrants.length,
          },
          {
            key: "attended",
            header: "Attended",
            hideBelow: "xl",
            cell: ({ meeting }) =>
              meeting.startedAt ? eligibleOrders(meeting, db.orders).length : "—",
          },
          {
            key: "status",
            header: "Status",
            cell: ({ meeting }) => <ClassStatusBadge meeting={meeting} />,
          },
        ]}
      />
    </>
  );
}

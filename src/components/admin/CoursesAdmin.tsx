"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import type { Catalogue } from "@/types/catalogue";
import { formatDateTime, formatPKR } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import { removeCourse, setEnrolmentOpen } from "@/server/actions/catalogue";

export function CoursesAdmin({ courses, categories, instructors }: Catalogue): ReactElement {
  const { run, pending } = useAction();
  const { notify } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Courses"
        description="Add masterclasses, set seats and control enrolment."
        actions={
          <Button href="/admin/courses/new" size="sm" arrow>
            New course
          </Button>
        }
      />
      <DataTable
        caption="Courses"
        rows={courses}
        rowKey={(course) => course.id}
        columns={[
          {
            key: "title",
            header: "Course",
            wrap: true,
            cell: (course) => (
              <div className="flex flex-col gap-1">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="inline-flex min-h-11 items-center font-semibold hover:text-teal-700 hover:underline"
                >
                  {course.title}
                </Link>
                <span className="text-ink-soft">
                  {categories.find((item) => item.id === course.categoryId)?.name} ·{" "}
                  {instructors.find((item) => item.id === course.instructorId)?.name}
                </span>
              </div>
            ),
          },
          {
            key: "start",
            header: "Class",
            hideBelow: "xl",
            cell: (course) => (
              <Link
                href={`/admin/classes/${course.id}`}
                className="inline-flex min-h-11 items-center hover:text-teal-700 hover:underline"
              >
                {formatDateTime(course.startsAt)}
              </Link>
            ),
          },
          {
            key: "seats",
            header: "Seats",
            cell: (course) => `${course.seatsTaken}/${course.seats}`,
          },
          {
            key: "price",
            header: "Price",
            hideBelow: "xl",
            cell: (course) => formatPKR(course.price),
          },
          {
            key: "status",
            header: "Status",
            cell: (course) => (
              <div className="flex flex-wrap gap-1">
                <Badge tone={course.status === "published" ? "success" : "neutral"}>
                  {course.status === "published" ? "Published" : "Draft"}
                </Badge>
                {!course.enrolmentOpen ? <Badge tone="warning">Closed</Badge> : null}
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (course) => (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  loading={pending === course.id}
                  onClick={() =>
                    run(
                      course.id,
                      () => setEnrolmentOpen({ id: course.id, open: !course.enrolmentOpen }),
                      course.enrolmentOpen ? "Enrolment closed." : "Enrolment opened.",
                    )
                  }
                >
                  {course.enrolmentOpen ? "Close" : "Open"}
                </Button>
                <Link
                  href={`/admin/courses/${course.id}`}
                  aria-label={`Edit ${course.title}`}
                  className="inline-flex size-11 items-center justify-center rounded-pill hover:bg-mist"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                </Link>
                <IconButton label={`Delete ${course.title}`} onClick={() => setDeleteId(course.id)}>
                  <Trash2 className="size-4 text-error-text" />
                </IconButton>
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete course?"
        body="A course with past orders is archived instead, so its history is kept. A class students have paid for can't be removed until it is completed."
        confirmLabel="Delete"
        danger
        loading={pending === "delete"}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          const result = await run("delete", () => removeCourse({ id: deleteId }));
          if (result.ok) notify(result.data.notice);
          setDeleteId(null);
        }}
      />
    </>
  );
}

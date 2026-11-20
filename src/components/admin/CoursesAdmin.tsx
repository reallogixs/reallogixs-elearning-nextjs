"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { catalogueApi } from "@/lib/api";
import { formatDate, formatPKR } from "@/lib/domain/format";
import { seatsTaken } from "@/lib/domain/orders";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { categoryById, instructorById } from "@/lib/store/selectors";
import { PageHeader } from "@/components/portal/PageHeader";
import { MODE_LABEL } from "@/components/courses/courseLabels";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";

export function CoursesAdmin(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Courses"
        description="Add courses, set batches and control enrolment."
        actions={
          <Button href="/admin/courses/new" size="sm" arrow>
            New course
          </Button>
        }
      />
      <DataTable
        caption="Courses"
        rows={db.courses}
        rowKey={(course) => course.id}
        columns={[
          {
            key: "title",
            header: "Course",
            cell: (course) => (
              <div className="flex flex-col gap-1">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="font-medium hover:text-teal-700 hover:underline"
                >
                  {course.title}
                </Link>
                <span className="text-ink-soft">
                  {categoryById(db, course.categoryId)?.name} ·{" "}
                  {instructorById(db, course.instructorId)?.name}
                </span>
              </div>
            ),
          },
          {
            key: "mode",
            header: "Mode",
            hideBelow: "lg",
            cell: (course) => MODE_LABEL[course.mode],
          },
          {
            key: "start",
            header: "Starts",
            hideBelow: "md",
            cell: (course) => formatDate(course.startDate),
          },
          {
            key: "seats",
            header: "Seats",
            cell: (course) => `${seatsTaken(db.orders, course.id)}/${course.seats}`,
          },
          {
            key: "price",
            header: "Price",
            hideBelow: "md",
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
                      () => catalogueApi.setEnrolmentOpen(course.id, !course.enrolmentOpen),
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
        body="This can't be undone. Courses with enrolments can't be deleted; set them to Draft instead."
        confirmLabel="Delete"
        danger
        loading={pending === "delete"}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await run("delete", () => catalogueApi.deleteCourse(deleteId), "Course deleted.");
          setDeleteId(null);
        }}
      />
    </>
  );
}

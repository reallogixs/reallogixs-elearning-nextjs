"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";

import type { Course } from "@/types/domain";
import { catalogueApi } from "@/lib/api";
import { slugify } from "@/lib/domain/format";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { courseSchema, type CourseFormValues } from "@/lib/validation/admin";
import { SelectField } from "@/components/form/SelectField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { SwitchField } from "@/components/form/SwitchField";
import { TextField } from "@/components/form/TextField";
import { TextareaField } from "@/components/form/TextareaField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";

import { categoryOptions } from "./categoryOptions";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
const MODES = [
  { value: "online", label: "Online (live)" },
  { value: "physical", label: "Physical (on campus)" },
];

function toForm(course?: Course): CourseFormValues {
  return {
    title: course?.title ?? "",
    slug: course?.slug ?? "",
    summary: course?.summary ?? "",
    description: course?.description ?? "",
    categoryId: course?.categoryId ?? "",
    instructorId: course?.instructorId ?? "",
    mode: course?.mode ?? "online",
    venue: course?.venue ?? "",
    schedule: course?.schedule ?? "",
    startDate: course?.startDate ?? "",
    durationWeeks: course?.durationWeeks ?? 8,
    seats: course?.seats ?? 30,
    price: course?.price ?? 0,
    level: course?.level ?? "beginner",
    outcomes: course?.outcomes.join("\n") ?? "",
    status: course?.status ?? "draft",
    enrolmentOpen: course?.enrolmentOpen ?? true,
    featured: course?.featured ?? false,
  };
}

export function CourseForm({ course }: { course?: Course }): ReactElement {
  const db = useDb();
  const router = useRouter();
  const { run } = useAction();

  return (
    <Formik
      initialValues={toForm(course)}
      validationSchema={courseSchema}
      onSubmit={async (values) => {
        const result = await run(
          "save",
          () => catalogueApi.saveCourse(values, course?.id),
          course ? "Course updated." : "Course created.",
        );
        if (result.ok) router.push("/admin/courses");
      }}
    >
      {({ values, handleBlur, setFieldValue }) => (
        <Form noValidate className="flex flex-col gap-6">
          <Card className="grid gap-5 md:grid-cols-2">
            <h2 className="text-h4 md:col-span-2">Basics</h2>
            <TextField
              name="title"
              label="Title"
              fieldClassName="md:col-span-2"
              onBlur={(event) => {
                handleBlur(event);
                if (!values.slug) void setFieldValue("slug", slugify(event.target.value));
              }}
            />
            <TextField
              name="slug"
              label="URL slug"
              hint="Used in /courses/your-slug."
              className="font-mono"
            />
            <SelectField name="level" label="Level" options={LEVELS} />
            <SelectField
              name="categoryId"
              label="Category"
              hint="Any level of the category tree."
              placeholder="Choose a category"
              options={categoryOptions(db.categories)}
            />
            <SelectField
              name="instructorId"
              label="Instructor"
              placeholder="Choose an instructor"
              options={db.instructors.map((instructor) => ({
                value: instructor.id,
                label: instructor.name,
              }))}
            />
            <TextField
              name="summary"
              label="Summary"
              hint="One line for cards and search results."
              fieldClassName="md:col-span-2"
            />
            <TextareaField
              name="description"
              label="Description"
              rows={5}
              fieldClassName="md:col-span-2"
            />
            <TextareaField
              name="outcomes"
              label="Learning outcomes"
              hint="One per line."
              rows={4}
              fieldClassName="md:col-span-2"
            />
          </Card>

          <Card className="grid gap-5 md:grid-cols-2">
            <h2 className="text-h4 md:col-span-2">Batch &amp; schedule</h2>
            <SelectField name="mode" label="Mode" options={MODES} />
            <TextField
              name="venue"
              label={values.mode === "physical" ? "Campus address" : "Platform"}
              hint={values.mode === "physical" ? "Where classes happen." : "e.g. Live on Zoom."}
            />
            <TextField
              name="schedule"
              label="Class schedule"
              hint="e.g. Sat & Sun · 8:00–10:00 pm PKT"
            />
            <TextField name="startDate" label="Start date" type="date" />
            <TextField
              name="durationWeeks"
              label="Duration (weeks)"
              type="number"
              min={1}
              inputMode="numeric"
            />
            <TextField
              name="seats"
              label="Seats"
              type="number"
              min={1}
              inputMode="numeric"
              hint="Confirmed enrolments count against this."
            />
            <TextField
              name="price"
              label="Price (PKR)"
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
            />
          </Card>

          <Card className="flex flex-col gap-2">
            <h2 className="mb-2 text-h4">Visibility</h2>
            <Switch
              label="Published"
              description="Draft courses are hidden from the public site."
              checked={values.status === "published"}
              onChange={(event) =>
                void setFieldValue("status", event.target.checked ? "published" : "draft")
              }
            />
            <SwitchField
              name="enrolmentOpen"
              label="Enrolment open"
              description="Turn off to stop new enrolments before the batch is full."
            />
            <SwitchField name="featured" label="Featured on home page" />
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" href="/admin/courses">
              Cancel
            </Button>
            <SubmitButton arrow>{course ? "Save changes" : "Create course"}</SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}

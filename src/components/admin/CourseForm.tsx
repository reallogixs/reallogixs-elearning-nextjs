"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";

import type { Category, Course, Instructor } from "@/types/domain";
import { slugify, toPktInput } from "@/lib/domain/format";
import { FEATURED_LIMIT } from "@/lib/domain/catalogue";
import { PAGE, startLoading } from "@/lib/loadingBar";
import { useAction } from "@/lib/useAction";
import { courseSchema, type CourseFormValues } from "@/lib/validation/admin";
import { SelectField } from "@/components/form/SelectField";
import { SubmitButton } from "@/components/form/SubmitButton";
import { SwitchField } from "@/components/form/SwitchField";
import { TextField } from "@/components/form/TextField";
import { TextareaField } from "@/components/form/TextareaField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { saveCourse } from "@/server/actions/catalogue";

import { BannerUploadField } from "./BannerUploadField";
import { categoryOptions } from "./categoryOptions";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function toForm(course?: Course): CourseFormValues {
  return {
    title: course?.title ?? "",
    slug: course?.slug ?? "",
    summary: course?.summary ?? "",
    description: course?.description ?? "",
    categoryId: course?.categoryId ?? "",
    instructorId: course?.instructorId ?? "",
    startsAt: course ? toPktInput(course.startsAt) : "",
    durationMinutes: course?.durationMinutes ?? 120,
    seats: course?.seats ?? 30,
    price: course?.price ?? 0,
    level: course?.level ?? "beginner",
    outcomes: course?.outcomes.join("\n") ?? "",
    status: course?.status ?? "draft",
    enrolmentOpen: course?.enrolmentOpen ?? true,
    featured: course?.featured ?? false,
    bannerUrl: course?.bannerUrl ?? null,
  };
}

export interface CourseFormProps {
  course?: Course;
  categories: Category[];
  instructors: Instructor[];
}

export function CourseForm({ course, categories, instructors }: CourseFormProps): ReactElement {
  const router = useRouter();
  const { run } = useAction();

  return (
    <Formik
      initialValues={toForm(course)}
      validationSchema={courseSchema}
      onSubmit={async (values) => {
        const result = await run(
          "save",
          () => saveCourse({ ...values, id: course?.id ?? "" }),
          course ? "Course updated." : "Course and Zoom meeting created.",
        );
        if (!result.ok) return;
        startLoading(PAGE);
        router.push("/admin/courses");
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
              options={categoryOptions(categories)}
            />
            <SelectField
              name="instructorId"
              label="Instructor"
              placeholder="Choose an instructor"
              options={instructors.map((instructor) => ({
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

          <Card>
            <BannerUploadField name="bannerUrl" />
          </Card>

          <Card className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1 md:col-span-2">
              <h2 className="text-h4">Masterclass</h2>
              <p className="text-small text-ink-soft">
                Live on Zoom. The meeting is created when you save the course.
              </p>
            </div>
            <TextField
              name="startsAt"
              label="Class date and time"
              type="datetime-local"
              hint="Pakistan time (PKT)."
            />
            <TextField
              name="durationMinutes"
              label="Length (minutes)"
              type="number"
              min={15}
              step={15}
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
              description="Turn off to stop new enrolments before the class is full."
            />
            <SwitchField
              name="featured"
              label="Featured on home page"
              description={`Shows once the course is published, until its class is completed. Up to ${FEATURED_LIMIT} appear, those taking enrolments first.`}
            />
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

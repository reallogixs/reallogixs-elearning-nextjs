"use client";

import { useState, type ReactElement } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Form, Formik } from "formik";

import type { Instructor } from "@/types/domain";
import { catalogueApi } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { instructorSchema, type InstructorFormValues } from "@/lib/validation/admin";
import { PageHeader } from "@/components/portal/PageHeader";
import { InstructorCard } from "@/components/courses/InstructorCard";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { TextareaField } from "@/components/form/TextareaField";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";

type Draft = { instructor?: Instructor } | null;

function InstructorForm({
  instructor,
  onDone,
}: {
  instructor?: Instructor;
  onDone: () => void;
}): ReactElement {
  const { run } = useAction();
  const initialValues: InstructorFormValues = {
    name: instructor?.name ?? "",
    title: instructor?.title ?? "",
    bio: instructor?.bio ?? "",
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={instructorSchema}
      onSubmit={async (values) => {
        const result = await run(
          "save",
          () => catalogueApi.saveInstructor(instructorSchema.cast(values), instructor?.id),
          "Instructor saved.",
        );
        if (result.ok) onDone();
      }}
    >
      <Form noValidate className="flex flex-col gap-5">
        <TextField name="name" label="Name" />
        <TextField name="title" label="Role / title" />
        <TextareaField name="bio" label="Short bio" />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
          <SubmitButton size="sm">Save</SubmitButton>
        </div>
      </Form>
    </Formik>
  );
}

/** Instructors are names shown on courses; they don't log in. */
export function InstructorsAdmin(): ReactElement {
  const db = useDb();
  const { run } = useAction();
  const [draft, setDraft] = useState<Draft>(null);
  return (
    <>
      <PageHeader
        title="Instructors"
        description="Shown on course pages. Instructors don't need a login."
        actions={
          <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setDraft({})}>
            Add instructor
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {db.instructors.map((instructor) => (
          <div key={instructor.id} className="relative bg-white">
            <InstructorCard instructor={instructor} />
            <div className="absolute top-2 right-2 flex">
              <IconButton
                label={`Edit ${instructor.name}`}
                onClick={() => setDraft({ instructor })}
              >
                <Pencil className="size-4" />
              </IconButton>
              <IconButton
                label={`Delete ${instructor.name}`}
                onClick={() =>
                  run(
                    "delete",
                    () => catalogueApi.deleteInstructor(instructor.id),
                    "Instructor removed.",
                  )
                }
              >
                <Trash2 className="size-4 text-error-text" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.instructor ? "Edit instructor" : "Add instructor"}
      >
        {draft ? (
          <InstructorForm
            key={draft.instructor?.id ?? "new"}
            instructor={draft.instructor}
            onDone={() => setDraft(null)}
          />
        ) : null}
      </Modal>
    </>
  );
}

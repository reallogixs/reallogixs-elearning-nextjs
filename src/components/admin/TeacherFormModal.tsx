"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";

import type { TeacherAccount } from "@/types/account";
import { useAction } from "@/lib/useAction";
import { teacherSchema, type TeacherFormValues } from "@/lib/validation/admin";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createTeacher, updateTeacher } from "@/server/actions/teachers";

export type TeacherDraft = { teacher?: TeacherAccount } | null;

function TeacherForm({
  teacher,
  onDone,
  onLink,
}: {
  teacher?: TeacherAccount;
  onDone: () => void;
  onLink: (name: string, url: string) => void;
}): ReactElement {
  const { run } = useAction();
  const router = useRouter();
  const initialValues: TeacherFormValues = {
    name: teacher?.name ?? "",
    email: teacher?.email ?? "",
    phone: teacher?.phone ?? "",
    promoCode: teacher?.promoCode ?? "",
    commissionPct: teacher?.commissionPct ?? 10,
    discountPct: teacher?.discountPct ?? 0,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={teacherSchema}
      onSubmit={async (raw) => {
        const values = teacherSchema.cast(raw);
        const result = teacher
          ? await run(
              "save",
              () => updateTeacher({ ...values, id: teacher.id }),
              "Teacher updated. New rates apply to future sales.",
            )
          : await run("save", () => createTeacher(values));
        if (!result.ok) return;
        if (result.data) onLink(values.name, result.data.link);
        router.refresh();
        onDone();
      }}
    >
      <Form noValidate className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" fieldClassName="sm:col-span-2" />
        <TextField name="email" label="Email" type="email" />
        <TextField name="phone" label="Phone" type="tel" />
        <TextField
          name="promoCode"
          label="Promo code"
          optional
          hint={
            teacher ? "Changing it stops the old code working." : "Leave blank to generate one."
          }
          className="font-mono uppercase"
          fieldClassName="sm:col-span-2"
        />
        <TextField
          name="commissionPct"
          label="Teacher commission (%)"
          hint="Of what the student pays."
          type="number"
          min={0}
          max={100}
          step={0.5}
          inputMode="decimal"
        />
        <TextField
          name="discountPct"
          label="Student discount (%)"
          hint="0 for no discount."
          type="number"
          min={0}
          max={100}
          step={0.5}
          inputMode="decimal"
        />
        {!teacher ? (
          <Alert tone="info" className="sm:col-span-2">
            Next you get a one-time link to send them, so they can choose a password. Their promo
            code is in their portal.
          </Alert>
        ) : null}
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
          <SubmitButton size="sm">{teacher ? "Save changes" : "Add teacher"}</SubmitButton>
        </div>
      </Form>
    </Formik>
  );
}

export function TeacherFormModal({
  draft,
  onClose,
  onLink,
}: {
  draft: TeacherDraft;
  onClose: () => void;
  onLink: (name: string, url: string) => void;
}): ReactElement {
  return (
    <Modal
      open={Boolean(draft)}
      onClose={onClose}
      title={draft?.teacher ? "Edit teacher" : "Add teacher"}
      description="Only admins can create teacher accounts."
    >
      {draft ? (
        <TeacherForm
          key={draft.teacher?.id ?? "new"}
          teacher={draft.teacher}
          onDone={onClose}
          onLink={onLink}
        />
      ) : null}
    </Modal>
  );
}

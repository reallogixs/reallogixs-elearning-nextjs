"use client";

import type { ReactElement } from "react";
import { Form, Formik } from "formik";

import type { Registrant } from "@/types/domain";
import { meetingsApi } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import { registrantEmailSchema } from "@/lib/validation/admin";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface RegistrantEmailModalProps {
  courseId: string;
  registrant: Registrant | null;
  onClose: () => void;
}

/** When a student's Zoom account uses a different email from the one they paid with. */
export function RegistrantEmailModal({
  courseId,
  registrant,
  onClose,
}: RegistrantEmailModalProps): ReactElement {
  const { run } = useAction();
  return (
    <Modal
      open={Boolean(registrant)}
      onClose={onClose}
      size="sm"
      title="Change Zoom email"
      description="They get a new personal link. The old one stops working."
    >
      {registrant ? (
        <Formik
          initialValues={{ email: registrant.email }}
          validationSchema={registrantEmailSchema}
          onSubmit={async (values) => {
            const result = await run(
              "email",
              () => meetingsApi.changeRegistrantEmail(courseId, registrant.orderId, values),
              "Zoom email changed. New link emailed.",
            );
            if (result.ok) onClose();
          }}
        >
          <Form noValidate className="flex flex-col gap-5">
            <TextField name="email" label={`Zoom email for ${registrant.name}`} type="email" />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton size="sm">Save &amp; send link</SubmitButton>
            </div>
          </Form>
        </Formik>
      ) : null}
    </Modal>
  );
}

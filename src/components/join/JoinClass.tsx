"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { LogIn, Video } from "lucide-react";

import type { JoinInfo } from "@/types/portal";
import { formatClassTime, formatDate } from "@/lib/domain/format";
import { ADMISSION_MESSAGE } from "@/lib/domain/meeting";
import { useAction } from "@/lib/useAction";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { joinClassSchema } from "@/lib/validation/certificate";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { joinClass, leaveClass } from "@/server/actions/join";

/**
 * MOCK of Zoom's door. The real personal link opens Zoom, which checks the signed-in
 * account itself; here the student states which Zoom account they're signed in with.
 */
export function JoinClass({ token, info }: { token: string; info: JoinInfo }): ReactElement {
  const router = useRouter();
  const { run, pending } = useAction();
  /** The account that got in from this page; being inside is never assumed from the link alone. */
  const [account, setAccount] = useState<string | null>(null);
  const ended = info.status === "ended";
  const inside = account !== null && info.status === "live";

  // Shows the class starting or ending without a reload.
  useAutoRefresh(!ended);

  return (
    <section className="shell flex max-w-2xl flex-col gap-6 py-12 lg:py-16">
      <div className="flex flex-col items-start gap-3">
        <ClassStatusBadge meeting={info} />
        <h1 className="text-h2">{info.title}</h1>
        <p className="text-ink-soft">
          {formatDate(info.startsAt)}, {formatClassTime(info.startsAt, info.durationMinutes)}
        </p>
      </div>
      {inside ? (
        <Card className="flex flex-col items-start gap-4 p-6 sm:p-8">
          <Video aria-hidden="true" className="size-8 text-teal-600" />
          <h2 className="text-h4">You&apos;re in the class</h2>
          <p className="text-ink-soft">Your attendance is recorded.</p>
          <Button
            variant="danger"
            size="sm"
            loading={pending === "leave"}
            onClick={async () => {
              const result = await run(
                "leave",
                () => leaveClass({ token, email: account }),
                "You left the class.",
              );
              if (result.ok) setAccount(null);
            }}
          >
            Leave class
          </Button>
        </Card>
      ) : ended ? (
        <Alert tone="info">{ADMISSION_MESSAGE.ended}</Alert>
      ) : (
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <Alert tone="info" title="Simulated Zoom sign-in">
            Zoom asks you to sign in and only admits the account you were invited with.
          </Alert>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={joinClassSchema}
            onSubmit={async (values, { setStatus }) => {
              const { email } = joinClassSchema.cast(values);
              setStatus(undefined);
              const result = await joinClass({ token, email });
              if (!result.ok) setStatus(result.error);
              else {
                setAccount(email);
                router.refresh();
              }
            }}
          >
            <Form noValidate method="post" className="flex flex-col gap-5">
              <TextField
                name="email"
                label="Zoom account email"
                type="email"
                autoComplete="email"
                hint="Use the email your invite was sent to."
              />
              <FormStatus />
              <SubmitButton className="self-start">
                <span className="inline-flex items-center gap-2">
                  <LogIn aria-hidden="true" className="size-4" /> Join class
                </span>
              </SubmitButton>
            </Form>
          </Formik>
          {info.status === "scheduled" ? (
            <p className="text-small text-ink-soft" aria-live="polite">
              {ADMISSION_MESSAGE.not_started} This page updates by itself when it starts.
            </p>
          ) : null}
        </Card>
      )}
    </section>
  );
}

"use client";

import { useState, type ReactElement } from "react";
import { Form, Formik } from "formik";
import { LogIn, Video } from "lucide-react";

import { meetingsApi } from "@/lib/api";
import { formatClassTime, formatDate } from "@/lib/domain/format";
import { ADMISSION_MESSAGE, isInMeeting } from "@/lib/domain/meeting";
import { useAction } from "@/lib/useAction";
import { useDb, useHydrated } from "@/lib/store/hooks";
import { courseById } from "@/lib/store/selectors";
import { joinClassSchema } from "@/lib/validation/certificate";
import { FormStatus } from "@/components/form/FormStatus";
import { SubmitButton } from "@/components/form/SubmitButton";
import { TextField } from "@/components/form/TextField";
import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * MOCK of Zoom's door. The real personal link opens Zoom, which checks the signed-in
 * account itself; here the student states which Zoom account they're signed in with.
 */
export function JoinClass({ token }: { token: string }): ReactElement {
  const db = useDb();
  const hydrated = useHydrated();
  const { run, pending } = useAction();
  /** The account that got in from this page; being inside is never assumed from the link alone. */
  const [account, setAccount] = useState<string | null>(null);
  const meeting = db.meetings.find((item) =>
    item.registrants.some((registrant) => registrant.joinToken === token),
  );
  const registrant = meeting?.registrants.find((item) => item.joinToken === token);
  const course = meeting ? courseById(db, meeting.courseId) : undefined;

  if (!hydrated) return <Skeleton className="shell my-16 h-96" />;
  if (!meeting || !registrant || !course)
    return (
      <NotFoundState
        title="This join link doesn't work"
        body={ADMISSION_MESSAGE.invalid_link}
        href="/track"
        cta="Find my order"
      />
    );

  const inside =
    account === registrant.email &&
    meeting.status === "live" &&
    isInMeeting(meeting, registrant.orderId);

  return (
    <section className="shell flex max-w-2xl flex-col gap-6 py-12 lg:py-16">
      <div className="flex flex-col items-start gap-3">
        <ClassStatusBadge meeting={meeting} />
        <h1 className="text-h2">{course.title}</h1>
        <p className="text-ink-soft">
          {formatDate(course.startsAt)}, {formatClassTime(course.startsAt, course.durationMinutes)}
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
            onClick={() =>
              run("leave", () => meetingsApi.leaveMeeting(token), "You left the class.")
            }
          >
            Leave class
          </Button>
        </Card>
      ) : meeting.status === "ended" ? (
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
              const result = await meetingsApi.joinMeeting(token, email);
              setStatus(result.ok ? undefined : result.error);
              if (result.ok) setAccount(email);
            }}
          >
            <Form noValidate className="flex flex-col gap-5">
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
          {meeting.status === "scheduled" ? (
            <p className="text-small text-ink-soft" aria-live="polite">
              {ADMISSION_MESSAGE.not_started} This page updates by itself when it starts.
            </p>
          ) : null}
        </Card>
      )}
    </section>
  );
}

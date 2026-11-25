"use client";

import { useState, type ReactElement } from "react";
import { CircleCheck, CircleStop, Play } from "lucide-react";

import type { Meeting } from "@/types/domain";
import { eligibleOrders } from "@/lib/domain/meeting";
import { useAction } from "@/lib/useAction";
import { usePortalData } from "@/components/data/PortalData";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { completeClass, endClass, startClass } from "@/server/actions/classes";

/** Start, end and complete. Start/end stand in for Zoom's own host controls in the demo. */
export function ClassControls({ meeting }: { meeting: Meeting }): ReactElement | null {
  const db = usePortalData();
  const { run, pending } = useAction();
  const { notify } = useToast();
  const [completing, setCompleting] = useState(false);
  const { courseId } = meeting;
  const attendees = eligibleOrders(meeting, db.orders).length;
  const people = attendees === 1 ? "1 student" : `${attendees} students`;
  if (meeting.completedAt) return null;

  async function complete(): Promise<void> {
    const result = await run("complete", () => completeClass({ id: courseId }));
    if (result.ok)
      notify(
        result.data.issued === 1
          ? "Class completed. 1 certificate emailed."
          : `Class completed. ${result.data.issued} certificates emailed.`,
      );
    setCompleting(false);
  }

  return (
    <>
      {meeting.status === "scheduled" ? (
        <Button
          size="sm"
          icon={<Play className="size-4" />}
          loading={pending === "start"}
          onClick={() =>
            run(
              "start",
              () => startClass({ id: courseId }),
              "Class started. Enrolment is now closed.",
            )
          }
        >
          Start class
        </Button>
      ) : null}
      {meeting.status === "live" ? (
        <Button
          size="sm"
          variant="danger"
          icon={<CircleStop className="size-4" />}
          loading={pending === "end"}
          onClick={() => run("end", () => endClass({ id: courseId }), "Class ended.")}
        >
          End class
        </Button>
      ) : null}
      {meeting.startedAt ? (
        <Button
          size="sm"
          icon={<CircleCheck className="size-4" />}
          onClick={() => setCompleting(true)}
        >
          Mark completed
        </Button>
      ) : null}
      <ConfirmDialog
        open={completing}
        title="Mark this class completed?"
        body={`${meeting.status === "live" ? "The class will end for everyone. " : ""}Certificates will be created and emailed to ${people} who joined after the class started. This can't be undone.`}
        confirmLabel="Complete & send"
        loading={pending === "complete"}
        onConfirm={complete}
        onClose={() => setCompleting(false)}
      />
    </>
  );
}

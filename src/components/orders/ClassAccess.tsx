"use client";

import type { ReactElement } from "react";
import { Award, Video } from "lucide-react";

import type { Order } from "@/types/domain";
import { formatClassTime, formatDate } from "@/lib/domain/format";
import { certificateForOrder, courseById, meetingFor } from "@/lib/portal/selectors";
import { usePortalData } from "@/components/data/PortalData";
import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** For a confirmed order: the personal Zoom link, then the certificate once completed. */
export function ClassAccess({ order }: { order: Order }): ReactElement | null {
  const db = usePortalData();
  const course = courseById(db, order.courseId);
  const meeting = meetingFor(db, order.courseId);
  const registrant = meeting?.registrants.find((item) => item.orderId === order.id);
  const certificate = certificateForOrder(db, order.id);
  if (!course || !meeting) return null;

  if (certificate && !certificate.revokedAt)
    return (
      <Card className="flex flex-col items-start gap-4">
        <Award aria-hidden="true" className="size-7 text-teal-600" />
        <div>
          <h2 className="text-h4">Your e-certificate is ready</h2>
          <p className="text-small text-ink-soft">
            Code <span className="font-mono text-ink">{certificate.code}</span>. We also emailed it
            to you.
          </p>
        </div>
        <Button href={`/certificates/${certificate.code}`} size="sm" arrow>
          View certificate
        </Button>
      </Card>
    );
  if (certificate)
    return <Alert tone="warning">The certificate for this class has been revoked.</Alert>;
  if (meeting.completedAt)
    return (
      <Alert tone="info" title="This class is completed">
        Certificates go to students who joined the class after it started. We have no record of you
        joining.
      </Alert>
    );
  if (meeting.status === "ended")
    return (
      <Alert tone="info" title="This class has ended">
        If you joined, your certificate arrives once the class is marked completed.
      </Alert>
    );
  if (!registrant) return null;
  return (
    <Card className="flex flex-col items-start gap-4">
      <ClassStatusBadge meeting={meeting} />
      <div className="flex flex-col gap-1">
        <h2 className="text-h4">Your Zoom class</h2>
        <p className="text-small text-ink-soft">
          {formatDate(course.startsAt)}, {formatClassTime(course.startsAt, course.durationMinutes)}
        </p>
        <p className="text-small text-ink-soft">
          Sign in to Zoom with <span className="font-medium text-ink">{registrant.email}</span>.
          Other accounts are turned away. Join while the class is running to earn your certificate.
        </p>
      </div>
      <Button href={`/join/${registrant.joinToken}`} size="sm" icon={<Video className="size-4" />}>
        {meeting.status === "live" ? "Join class now" : "Open join page"}
      </Button>
    </Card>
  );
}

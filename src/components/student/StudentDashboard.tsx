"use client";

import type { ReactElement } from "react";
import { Award, BookOpen, Clock, Search } from "lucide-react";

import { formatClassTime, formatDate } from "@/lib/domain/format";
import { byNewest, courseById, ordersForStudent } from "@/lib/portal/selectors";
import { useStudent } from "@/lib/account/useRoleUser";
import { useNow } from "@/lib/useNow";
import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

import { EnrolmentCard } from "./EnrolmentCard";

const DAY = 86_400_000;

export function StudentDashboard(): ReactElement | null {
  const db = usePortalData();
  const student = useStudent();
  const now = useNow().getTime();
  if (!student) return null;
  const orders = ordersForStudent(db, student).sort(byNewest);
  const confirmed = orders.filter((order) => order.status === "confirmed");
  const waiting = orders.filter(
    (order) => order.status === "pending" || order.status === "rejected",
  ).length;
  const orderIds = new Set(orders.map((order) => order.id));
  const certificates = db.certificates.filter(
    (certificate) => orderIds.has(certificate.orderId) && !certificate.revokedAt,
  ).length;
  const upcoming = confirmed
    .map((order) => courseById(db, order.courseId))
    .filter((course) => course && new Date(course.startsAt).getTime() > now)
    .sort((a, b) => (a?.startsAt ?? "").localeCompare(b?.startsAt ?? ""))[0];
  const daysToStart = upcoming
    ? Math.ceil((new Date(upcoming.startsAt).getTime() - now) / DAY)
    : null;

  return (
    <>
      <PageHeader
        title={`Hi ${student.name.split(" ")[0]}`}
        description="Your classes, payments and certificates."
      />

      <section
        aria-label="Next class"
        className="on-dark relative isolate flex flex-col gap-5 overflow-hidden rounded-md bg-mesh p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark" />
        <div className="flex flex-col gap-2">
          <p className="text-small font-medium text-on-dark">
            {upcoming ? "Your next class" : "Ready for your next skill?"}
          </p>
          <p className="text-dash-title text-white">
            {upcoming ? upcoming.title : "Find a course that fits your goals"}
          </p>
          {upcoming && daysToStart !== null ? (
            <p className="text-small text-on-dark">
              Starts {formatDate(upcoming.startsAt)} ·{" "}
              {daysToStart === 1 ? "tomorrow" : `in ${daysToStart} days`} ·{" "}
              {formatClassTime(upcoming.startsAt, upcoming.durationMinutes)}
            </p>
          ) : null}
        </div>
        <Button
          href="/courses"
          tone="dark"
          size="sm"
          icon={<Search className="size-4" />}
          className="self-start sm:self-center"
        >
          Browse courses
        </Button>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active courses" value={confirmed.length} icon={<BookOpen />} />
        <StatCard
          label="Needs attention"
          value={waiting}
          icon={<Clock />}
          hint={waiting ? "Awaiting verification or re-upload" : "Nothing pending"}
        />
        <StatCard label="Certificates" value={certificates} icon={<Award />} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-dash-heading">My enrolments</h2>
        <span className="text-dash-meta font-normal text-ink-soft">{orders.length} total</span>
      </div>
      {orders.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" />}
          title="No enrolments yet"
          body="When you enrol in a course it shows up here."
          action={
            <Button href="/courses" size="sm">
              Find a course
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <EnrolmentCard key={order.id} order={order} course={courseById(db, order.courseId)} />
          ))}
        </div>
      )}
    </>
  );
}

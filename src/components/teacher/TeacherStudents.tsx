"use client";

import type { ReactElement } from "react";

import { useDb } from "@/lib/store/hooks";
import { byNewest, ordersForTeacher } from "@/lib/store/selectors";
import { useTeacher } from "@/lib/store/useRoleUser";
import { PageHeader } from "@/components/portal/PageHeader";

import { ReferralsTable } from "./ReferralsTable";

export function TeacherStudents(): ReactElement | null {
  const db = useDb();
  const teacher = useTeacher();
  if (!teacher) return null;
  const orders = ordersForTeacher(db, teacher.id).sort(byNewest);
  return (
    <>
      <PageHeader
        title="My students"
        description="Everyone who enrolled with your promo code, and which course they chose."
      />
      <ReferralsTable db={db} orders={orders} />
    </>
  );
}

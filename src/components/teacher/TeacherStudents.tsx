"use client";

import type { ReactElement } from "react";

import { byNewest, ordersForTeacher } from "@/lib/portal/selectors";
import { useTeacher } from "@/lib/account/useRoleUser";
import { usePortalData } from "@/components/data/PortalData";
import { PageHeader } from "@/components/portal/PageHeader";

import { ReferralsTable } from "./ReferralsTable";

export function TeacherStudents(): ReactElement | null {
  const db = usePortalData();
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

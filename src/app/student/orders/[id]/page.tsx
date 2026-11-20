import type { ReactElement } from "react";

import { StudentOrder } from "@/components/student/StudentOrder";

export default async function StudentOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  return <StudentOrder orderId={id} />;
}

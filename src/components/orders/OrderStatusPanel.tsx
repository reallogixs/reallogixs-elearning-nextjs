"use client";

import type { ReactElement } from "react";

import type { Order } from "@/types/domain";
import { formatPKR } from "@/lib/domain/format";
import { courseById, paymentMethodById } from "@/lib/portal/selectors";
import { usePortalData, useUpdatePortalData } from "@/components/data/PortalData";
import { useContent } from "@/components/data/SiteData";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { useToast } from "@/components/ui/Toast";
import { reuploadReceipt } from "@/server/actions/checkout";

import { ClassAccess } from "./ClassAccess";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";
import { ReceiptForm } from "./ReceiptForm";
import { WhatsAppCta } from "./WhatsAppCta";

/**
 * Everything a student needs about one order: status, next step (re-upload or the
 * WhatsApp link) and history. Reads the loaded order, so an update shows at once.
 */
export function OrderStatusPanel({ orderId }: { orderId: string }): ReactElement | null {
  const db = usePortalData();
  const { checkout, community, contact } = useContent();
  const update = useUpdatePortalData();
  const { notify } = useToast();
  const order: Order | undefined = db.orders.find((candidate) => candidate.id === orderId);
  if (!order) return null;
  const course = courseById(db, order.courseId);
  const method = paymentMethodById(db, order.paymentMethodId);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-label text-ink-soft uppercase">Order number</p>
            <p className="flex items-center gap-1 font-mono text-h3 font-medium">
              {order.id}
              <CopyButton value={order.id} />
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <dl className="grid gap-4 border-t border-line pt-5 text-small sm:grid-cols-3">
          <div>
            <dt className="text-ink-soft">Course</dt>
            <dd className="font-medium">{course?.title ?? "Course"}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Paid</dt>
            <dd className="font-medium">
              {formatPKR(order.price.total)} {method ? `via ${method.name}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Student</dt>
            <dd className="font-medium">{order.contact.name}</dd>
          </div>
        </dl>
      </Card>

      {order.status === "pending" ? (
        <Alert tone="info" title="Awaiting verification">
          {checkout.pendingMessage}
        </Alert>
      ) : null}

      {order.status === "confirmed" ? (
        <>
          <ClassAccess order={order} />
          <WhatsAppCta community={community} />
        </>
      ) : null}

      {order.status === "rejected" ? (
        <Card className="flex flex-col gap-5">
          <Alert tone="danger" title="We couldn't verify your receipt">
            {order.rejectionReason}
          </Alert>
          <ReceiptForm
            help={checkout.receiptHelp}
            submitLabel="Upload new receipt"
            onSubmit={async (receipt) => {
              const result = await reuploadReceipt({
                ...receipt,
                orderId: order.id,
                phone: order.contact.phone,
              });
              if (result.ok) {
                update(result.data.data);
                notify("New receipt sent for verification.");
              }
              return result;
            }}
          />
        </Card>
      ) : null}

      {order.status === "cancelled" ? (
        <Alert tone="warning" title="This order was cancelled">
          Contact us at {contact.email} if you think this is a mistake.
        </Alert>
      ) : null}

      <Card>
        <h2 className="mb-4 text-h4">History</h2>
        <OrderTimeline events={order.history} />
      </Card>
    </div>
  );
}

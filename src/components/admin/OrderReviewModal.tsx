"use client";

import { useState, type ReactElement } from "react";

import type { Result } from "@/types/forms";
import { latestReceipt } from "@/lib/domain/orders";
import { useAction } from "@/lib/useAction";
import { courseById, paymentMethodById } from "@/lib/portal/selectors";
import { usePortalData } from "@/components/data/PortalData";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cancelOrder, confirmOrder, rejectOrder } from "@/server/actions/orders";

import { OrderFacts } from "./OrderFacts";
import { ReceiptPreview } from "./ReceiptPreview";
import { REJECT_FORM_ID, RejectReasonForm } from "./RejectReasonForm";

interface OrderReviewModalProps {
  orderId: string | null;
  onClose: () => void;
}

/** Receipt check: compare the receipt with the expected amount, then confirm or reject. */
export function OrderReviewModal({ orderId, onClose }: OrderReviewModalProps): ReactElement {
  const db = usePortalData();
  const { run, pending } = useAction();
  const [rejecting, setRejecting] = useState(false);
  const order = db.orders.find((candidate) => candidate.id === orderId);
  const receipt = order ? latestReceipt(order) : undefined;
  const reused = receipt
    ? db.orders.filter(
        (other) =>
          other.id !== orderId &&
          other.receipts.some(
            (item) => item.transactionRef.toLowerCase() === receipt.transactionRef.toLowerCase(),
          ),
      )
    : [];
  const course = order ? courseById(db, order.courseId) : undefined;

  function close(): void {
    setRejecting(false);
    onClose();
  }

  async function act(key: string, action: () => Promise<Result>, message: string): Promise<void> {
    const result = await run(key, action, message);
    if (result.ok) close();
  }

  function footer(): ReactElement | null {
    if (!order) return null;
    if (order.status === "pending" && rejecting) {
      return (
        <>
          <Button variant="ghost" size="sm" onClick={() => setRejecting(false)}>
            Back
          </Button>
          <Button
            type="submit"
            form={REJECT_FORM_ID}
            variant="danger"
            size="sm"
            loading={pending === "reject"}
          >
            Send rejection
          </Button>
        </>
      );
    }
    if (order.status === "pending") {
      return (
        <>
          <Button variant="danger" size="sm" onClick={() => setRejecting(true)}>
            Reject
          </Button>
          <Button
            size="sm"
            loading={pending === "confirm"}
            onClick={() =>
              act(
                "confirm",
                () => confirmOrder({ number: order.id }),
                "Payment confirmed. The student can now see the WhatsApp link.",
              )
            }
          >
            Confirm payment
          </Button>
        </>
      );
    }
    if (order.status === "cancelled") return null;
    return (
      <Button
        variant="danger"
        size="sm"
        loading={pending === "cancel"}
        onClick={async () => {
          const result = await run(
            "cancel",
            () => cancelOrder({ number: order.id }),
            "Order cancelled.",
          );
          if (result.ok) close();
        }}
      >
        Cancel order
      </Button>
    );
  }

  return (
    <Modal
      open={Boolean(order)}
      onClose={close}
      size="lg"
      title={order ? `Order ${order.id}` : "Order"}
      description={order ? `${order.contact.name} · ${course?.title ?? ""}` : undefined}
      footer={footer()}
    >
      {order ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            {receipt ? (
              <ReceiptPreview receipt={receipt} />
            ) : (
              <Alert tone="warning">No receipt uploaded.</Alert>
            )}
            {reused.length ? (
              <Alert tone="warning" title="This reference was used before">
                Also on {reused.map((other) => other.id).join(", ")}.
              </Alert>
            ) : null}
            {order.receipts.length > 1 ? (
              <p className="text-small text-ink-soft">
                {order.receipts.length - 1} earlier receipt(s) on file.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-5">
            <OrderStatusBadge status={order.status} />
            <OrderFacts
              order={order}
              method={paymentMethodById(db, order.paymentMethodId)}
              teacher={db.users.find((user) => user.id === order.commission?.teacherId)}
            />
            {rejecting ? (
              <RejectReasonForm
                onSubmit={(reason) =>
                  act(
                    "reject",
                    () => rejectOrder({ number: order.id, reason }),
                    "Receipt rejected. The student has been notified.",
                  )
                }
              />
            ) : (
              <OrderTimeline events={order.history} />
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

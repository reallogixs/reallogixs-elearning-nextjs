"use client";

import { useState, type ReactElement } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";

import type { PaymentMethod } from "@/types/domain";
import { settingsApi } from "@/lib/api";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";
import { PaymentMethodLogo } from "@/components/payments/PaymentMethodLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";

import { PaymentMethodForm } from "./PaymentMethodForm";

/** Admin-managed payment methods: logo, any detail rows, checkout order and visibility. */
export function PaymentMethodsAdmin(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const [draft, setDraft] = useState<{ method?: PaymentMethod } | null>(null);
  const [deleting, setDeleting] = useState<PaymentMethod | null>(null);
  const methods = [...db.paymentMethods].sort((a, b) => a.order - b.order);

  return (
    <>
      <PageHeader
        title="Payment methods"
        description="Wallets and bank accounts students pay into, in checkout order. Disabled methods are hidden."
        actions={
          <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setDraft({})}>
            Add method
          </Button>
        }
      />
      <ul className="flex flex-col gap-3">
        {methods.map((method, index) => (
          <li key={method.id}>
            <Card className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <PaymentMethodLogo
                  name={method.name}
                  logoUrl={method.logoUrl}
                  className="size-14"
                />
                <div className="min-w-0">
                  <p className="font-medium">{method.name}</p>
                  <p className="truncate text-small text-ink-soft">
                    {method.fields.map((field) => `${field.label}: ${field.value}`).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Switch
                  label="Visible"
                  checked={method.enabled}
                  onChange={(event) =>
                    run(
                      method.id,
                      () => settingsApi.setPaymentMethodEnabled(method.id, event.target.checked),
                      event.target.checked
                        ? `${method.name} shown at checkout.`
                        : `${method.name} hidden.`,
                    )
                  }
                  className="mr-3"
                />
                <IconButton
                  label={`Move ${method.name} up`}
                  disabled={index === 0}
                  onClick={() => run("move", () => settingsApi.movePaymentMethod(method.id, -1))}
                >
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton
                  label={`Move ${method.name} down`}
                  disabled={index === methods.length - 1}
                  onClick={() => run("move", () => settingsApi.movePaymentMethod(method.id, 1))}
                >
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton label={`Edit ${method.name}`} onClick={() => setDraft({ method })}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label={`Delete ${method.name}`} onClick={() => setDeleting(method)}>
                  <Trash2 className="size-4 text-error-text" />
                </IconButton>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.method ? `Edit ${draft.method.name}` : "Add payment method"}
        size="xl"
      >
        {draft ? (
          <PaymentMethodForm
            key={draft.method?.id ?? "new"}
            method={draft.method}
            onDone={() => setDraft(null)}
          />
        ) : null}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name ?? "method"}?`}
        body="This can't be undone. Methods already used by orders can't be deleted; hide them instead."
        confirmLabel="Delete"
        danger
        loading={pending === "delete"}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await run(
            "delete",
            () => settingsApi.deletePaymentMethod(deleting.id),
            "Payment method deleted.",
          );
          setDeleting(null);
        }}
      />
    </>
  );
}

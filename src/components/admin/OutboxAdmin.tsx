"use client";

import { useState, type ReactElement } from "react";
import { Mail, Paperclip } from "lucide-react";

import type { OutboxEmail } from "@/types/domain";
import { formatDateTime } from "@/lib/domain/format";
import { useDb } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

/** MOCK: shows the emails the app would send once SMTP is connected. */
export function OutboxAdmin(): ReactElement {
  const { outbox } = useDb();
  const [open, setOpen] = useState<OutboxEmail | null>(null);
  return (
    <>
      <PageHeader
        title="Email outbox"
        description="Demo only: emails the platform would send, including teacher passwords."
      />
      <Alert tone="info">
        No email is actually sent yet. Once Nodemailer (Hostinger SMTP) is connected, these go to
        the recipients directly.
      </Alert>
      <DataTable
        caption="Outbox"
        rows={outbox}
        rowKey={(email) => email.id}
        empty={
          <EmptyState
            icon={<Mail className="size-5" />}
            title="Outbox is empty"
            body="Add a teacher or confirm a payment to see emails here."
          />
        }
        columns={[
          {
            key: "subject",
            header: "Subject",
            cell: (email) => (
              <button
                type="button"
                onClick={() => setOpen(email)}
                className="min-h-11 text-left font-medium text-teal-700 hover:underline"
              >
                {email.subject}
              </button>
            ),
          },
          { key: "to", header: "To", hideBelow: "md", cell: (email) => email.to },
          {
            key: "date",
            header: "Sent",
            hideBelow: "md",
            cell: (email) => formatDateTime(email.createdAt),
          },
        ]}
      />
      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.subject ?? ""}
        description={open ? `To ${open.to}` : undefined}
      >
        <pre className="font-sans text-body whitespace-pre-wrap">{open?.body}</pre>
        {open?.attachments?.map((file) => (
          <Button
            key={file.href}
            href={file.href}
            target="_blank"
            size="sm"
            variant="secondary"
            icon={<Paperclip className="size-4" />}
            className="mt-5"
          >
            {file.name}
          </Button>
        ))}
      </Modal>
    </>
  );
}

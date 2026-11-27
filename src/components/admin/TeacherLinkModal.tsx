"use client";

import type { ReactElement } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";

/** While teachers aren't emailed, the admin passes the one-time link on (e.g. on WhatsApp). */
export function TeacherLinkModal({
  link,
  onClose,
}: {
  link: { name: string; url: string } | null;
  onClose: () => void;
}): ReactElement {
  return (
    <Modal
      open={Boolean(link)}
      onClose={onClose}
      size="sm"
      title={`Password link for ${link?.name ?? "the teacher"}`}
      description="Send it to them privately. It works once, for 48 hours, and lets them choose their password."
      footer={
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      }
    >
      {link ? (
        <div className="flex items-start gap-3 rounded-md border border-line bg-mist p-4">
          <KeyRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-600" />
          <p className="min-w-0 flex-1 font-mono text-small break-all">{link.url}</p>
          <CopyButton value={link.url} className="-my-2" />
        </div>
      ) : null}
    </Modal>
  );
}

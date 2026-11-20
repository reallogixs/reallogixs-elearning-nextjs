import type { ReactElement } from "react";
import { FileText } from "lucide-react";

import type { Receipt } from "@/types/domain";
import { formatDateTime } from "@/lib/domain/format";

export function ReceiptPreview({ receipt }: { receipt: Receipt }): ReactElement {
  const isImage = receipt.mimeType.startsWith("image/");
  return (
    <figure className="flex flex-col gap-2">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs from uploads; next/image can't optimise these.
        <img
          src={receipt.url}
          alt={`Payment receipt, reference ${receipt.transactionRef}`}
          className="max-h-[28rem] w-full rounded-md border border-line bg-mist object-contain"
        />
      ) : (
        <a
          href={receipt.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-24 items-center justify-center gap-2 rounded-md border border-line bg-mist text-teal-700 underline"
        >
          <FileText aria-hidden="true" className="size-5" /> Open PDF receipt
        </a>
      )}
      <figcaption className="text-small text-ink-soft">
        Ref <span className="font-mono text-ink">{receipt.transactionRef}</span> · uploaded{" "}
        {formatDateTime(receipt.uploadedAt)}
      </figcaption>
    </figure>
  );
}

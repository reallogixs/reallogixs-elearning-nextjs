import type { ReactElement } from "react";
import { MessageCircle } from "lucide-react";

import type { SiteContent } from "@/types/domain";
import { CircuitLine } from "@/components/brand/CircuitLine";
import { Button } from "@/components/ui/Button";

/** Shown only once the admin confirms payment. */
export function WhatsAppCta({ community }: { community: SiteContent["community"] }): ReactElement {
  return (
    <div className="on-dark relative overflow-hidden rounded-lg bg-gradient-deep p-6 text-white sm:p-8">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-glow" />
      <div className="relative flex flex-col gap-4">
        <MessageCircle aria-hidden="true" className="size-8 text-cyan-glow" />
        <p className="font-display text-h3">{community.title}</p>
        <p className="max-w-xl text-on-dark">{community.body}</p>
        <div>
          <Button
            href={community.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            tone="dark"
            arrow
          >
            Join the WhatsApp community
          </Button>
        </div>
        <CircuitLine className="mt-2 opacity-50" />
      </div>
    </div>
  );
}

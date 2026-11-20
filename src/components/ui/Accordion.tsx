import type { ReactElement } from "react";
import { Plus } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  body: string;
}

/** Native <details> accordion: keyboard and screen-reader friendly with no JS. */
export function Accordion({ items }: { items: AccordionItem[] }): ReactElement {
  return (
    <div className="flex flex-col divide-y divide-line">
      {items.map((item) => (
        <details key={item.id} className="group">
          <summary className="flex min-h-16 items-center justify-between gap-4 py-4 font-display text-h4 [&::-webkit-details-marker]:hidden">
            {item.title}
            <Plus
              aria-hidden="true"
              className="size-5 shrink-0 text-teal-600 transition-transform duration-base group-open:rotate-45"
            />
          </summary>
          <p className="max-w-3xl pb-6 text-ink-soft">{item.body}</p>
        </details>
      ))}
    </div>
  );
}

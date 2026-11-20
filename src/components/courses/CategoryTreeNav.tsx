import type { ReactElement } from "react";

import { cn } from "@/lib/cn";
import type { CategoryNode } from "@/lib/domain/categories";

interface CategoryTreeNavProps {
  nodes: CategoryNode[];
  activeSlug: string | null;
  counts: Map<string, number>;
  onSelect: (slug: string | null) => void;
}

function Branch({ nodes, activeSlug, counts, onSelect }: CategoryTreeNavProps): ReactElement {
  return (
    <ul className="flex flex-col">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            aria-pressed={activeSlug === node.slug}
            onClick={() => onSelect(node.slug)}
            style={{ paddingLeft: `${0.75 + node.depth * 1}rem` }}
            className={cn(
              "flex min-h-10 w-full items-center justify-between gap-2 rounded-sm pr-3 text-left text-small transition-colors",
              activeSlug === node.slug
                ? "bg-navy-900 text-white"
                : "text-ink-soft hover:bg-mist hover:text-ink",
              node.depth === 0 && "font-medium text-ink",
              activeSlug === node.slug && "text-white",
            )}
          >
            {node.name}
            <span className="font-mono text-label opacity-70">{counts.get(node.id) ?? 0}</span>
          </button>
          {node.children.length > 0 ? (
            <Branch
              nodes={node.children}
              activeSlug={activeSlug}
              counts={counts}
              onSelect={onSelect}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Nested, any-depth category filter. */
export function CategoryTreeNav(props: CategoryTreeNavProps): ReactElement {
  const { activeSlug, onSelect } = props;
  return (
    <nav aria-label="Categories" className="flex flex-col gap-1">
      <button
        type="button"
        aria-pressed={activeSlug === null}
        onClick={() => onSelect(null)}
        className={cn(
          "flex min-h-10 items-center rounded-sm px-3 text-left text-small font-medium",
          activeSlug === null ? "bg-navy-900 text-white" : "hover:bg-mist",
        )}
      >
        All courses
      </button>
      <Branch {...props} />
    </nav>
  );
}

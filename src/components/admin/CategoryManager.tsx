"use client";

import { useState, type CSSProperties, type ReactElement } from "react";
import { ArrowDown, ArrowUp, FolderPlus, Pencil, Trash2 } from "lucide-react";

import type { Category } from "@/types/domain";
import { catalogueApi } from "@/lib/api";
import { buildCategoryTree, descendantIds, type CategoryNode } from "@/lib/domain/categories";
import { useAction } from "@/lib/useAction";
import { useDb } from "@/lib/store/hooks";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";

import { CategoryFormModal, type CategoryDraft } from "./CategoryFormModal";

interface RowProps {
  node: CategoryNode;
  index: number;
  siblings: number;
  courseCount: (id: string) => number;
  onEdit: (draft: CategoryDraft) => void;
  onDelete: (category: Category) => void;
}

function CategoryRow({
  node,
  index,
  siblings,
  courseCount,
  onEdit,
  onDelete,
}: RowProps): ReactElement {
  const { run } = useAction();
  return (
    <li>
      <div
        className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-line py-2 pr-2 pl-[calc(1rem+var(--depth)*0.75rem)] sm:pl-[calc(1rem+var(--depth)*1.5rem)]"
        style={{ "--depth": node.depth } as CSSProperties}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {node.depth > 0 ? (
            <span aria-hidden="true" className="text-line">
              └
            </span>
          ) : null}
          <span className="flex min-w-0 flex-col">
            <span className={node.depth === 0 ? "truncate font-semibold" : "truncate"}>
              {node.name}
            </span>
            <span className="truncate text-dash-meta font-normal text-ink-soft">
              <span className="hidden sm:inline">/{node.slug} · </span>
              {courseCount(node.id) === 1 ? "1 course" : `${courseCount(node.id)} courses`}
            </span>
          </span>
        </div>
        <div className="ml-auto flex items-center">
          <IconButton
            label={`Move ${node.name} up`}
            disabled={index === 0}
            onClick={() => run("move", () => catalogueApi.moveCategory(node.id, -1))}
          >
            <ArrowUp className="size-4" />
          </IconButton>
          <IconButton
            label={`Move ${node.name} down`}
            disabled={index === siblings - 1}
            onClick={() => run("move", () => catalogueApi.moveCategory(node.id, 1))}
          >
            <ArrowDown className="size-4" />
          </IconButton>
          <IconButton
            label={`Add sub-category to ${node.name}`}
            onClick={() => onEdit({ parentId: node.id })}
          >
            <FolderPlus className="size-4" />
          </IconButton>
          <IconButton
            label={`Edit ${node.name}`}
            onClick={() => onEdit({ category: node, parentId: node.parentId })}
          >
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={`Delete ${node.name}`} onClick={() => onDelete(node)}>
            <Trash2 className="size-4 text-error-text" />
          </IconButton>
        </div>
      </div>
      {node.children.length ? (
        <ul>
          {node.children.map((child, childIndex) => (
            <CategoryRow
              key={child.id}
              node={child}
              index={childIndex}
              siblings={node.children.length}
              courseCount={courseCount}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Unlimited-depth category tree: add, nest, reorder, rename and delete. */
export function CategoryManager(): ReactElement {
  const db = useDb();
  const { run, pending } = useAction();
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const tree = buildCategoryTree(db.categories);
  const courseCount = (id: string): number => {
    const ids = descendantIds(db.categories, id);
    return db.courses.filter((course) => ids.has(course.categoryId)).length;
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Nest categories as deep as you need. Courses can sit at any level."
        actions={
          <Button
            size="sm"
            icon={<FolderPlus className="size-4" />}
            onClick={() => setDraft({ parentId: null })}
          >
            New top-level category
          </Button>
        }
      />
      <div className="rounded-md border border-line bg-white">
        <ul>
          {tree.map((node, index) => (
            <CategoryRow
              key={node.id}
              node={node}
              index={index}
              siblings={tree.length}
              courseCount={courseCount}
              onEdit={setDraft}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      </div>
      <CategoryFormModal draft={draft} onClose={() => setDraft(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name ?? "category"}?`}
        body="Only empty categories (no sub-categories or courses) can be deleted."
        confirmLabel="Delete"
        danger
        loading={pending === "delete"}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await run("delete", () => catalogueApi.deleteCategory(deleting.id), "Category deleted.");
          setDeleting(null);
        }}
      />
    </>
  );
}

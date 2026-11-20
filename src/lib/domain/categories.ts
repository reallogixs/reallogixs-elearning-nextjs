import type { Category, ID } from "@/types/domain";

export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
}

function byOrder(a: Category, b: Category): number {
  return a.order - b.order || a.name.localeCompare(b.name);
}

/** Builds the nested tree from the flat list (any depth). */
export function buildCategoryTree(
  categories: Category[],
  parentId: ID | null = null,
  depth = 0,
): CategoryNode[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort(byOrder)
    .map((category) => ({
      ...category,
      depth,
      children: buildCategoryTree(categories, category.id, depth + 1),
    }));
}

/** Depth-first list, handy for indented <select> options. */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

/** The category itself plus every category nested under it. */
export function descendantIds(categories: Category[], id: ID): Set<ID> {
  const ids = new Set<ID>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        grew = true;
      }
    }
  }
  return ids;
}

/** Root → leaf trail for breadcrumbs. */
export function categoryTrail(categories: Category[], id: ID): Category[] {
  const trail: Category[] = [];
  let current = categories.find((category) => category.id === id);
  while (current) {
    trail.unshift(current);
    const parentId: ID | null = current.parentId;
    current = parentId ? categories.find((category) => category.id === parentId) : undefined;
  }
  return trail;
}

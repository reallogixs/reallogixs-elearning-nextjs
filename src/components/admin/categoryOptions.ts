import type { Category } from "@/types/domain";
import { buildCategoryTree, flattenTree } from "@/lib/domain/categories";
import type { SelectOption } from "@/components/ui/Select";

/** Indented options so the nesting reads in a native <select>. */
export function categoryOptions(categories: Category[], exclude?: Set<string>): SelectOption[] {
  return flattenTree(buildCategoryTree(categories))
    .filter((node) => !exclude?.has(node.id))
    .map((node) => ({
      value: node.id,
      label: `${"   ".repeat(node.depth)}${node.depth ? "└ " : ""}${node.name}`,
    }));
}

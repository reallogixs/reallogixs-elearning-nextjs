import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide on small screens; the row stays readable through the remaining cells. */
  hideBelow?: "md" | "lg" | "xl";
  /** Let long text wrap (cells stay on one line by default). */
  wrap?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  caption: string;
  empty?: ReactNode;
}

const hide = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

/** Generic, accessible table with a visually hidden caption. */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  caption,
  empty,
}: DataTableProps<T>): ReactElement {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-x-auto rounded-md border border-line/80 bg-white shadow-soft">
      <table className="w-full text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-canvas/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-dash-meta font-semibold whitespace-nowrap text-ink-soft",
                  column.hideBelow && hide[column.hideBelow],
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="align-middle transition-colors hover:bg-canvas">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3",
                    !column.wrap && "whitespace-nowrap",
                    column.hideBelow && hide[column.hideBelow],
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

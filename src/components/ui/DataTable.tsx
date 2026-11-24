import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide on medium screens; the row stays readable through the remaining cells. */
  hideBelow?: "md" | "lg" | "xl" | "2xl";
  /** Let long text wrap (cells stay on one line by default). */
  wrap?: boolean;
  /** On phones each row is a card: the first column is its title; "hidden" leaves a column out. */
  mobile?: "row" | "hidden";
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
  "2xl": "hidden 2xl:table-cell",
} as const;

/** Columns whose key is "actions" sit at the bottom of the mobile card. */
const ACTIONS = "actions";

function MobileCards<T>({
  rows,
  columns,
  rowKey,
  caption,
}: Omit<DataTableProps<T>, "empty">): ReactElement {
  const [title, ...rest] = columns;
  const details = rest.filter((column) => column.key !== ACTIONS && column.mobile !== "hidden");
  const actions = columns.find((column) => column.key === ACTIONS);
  return (
    <ul aria-label={caption} className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => (
        <li
          key={rowKey(row)}
          className="flex flex-col gap-3 rounded-md border border-line/80 bg-white p-4 shadow-soft"
        >
          {title ? <div className="text-small font-semibold">{title.cell(row)}</div> : null}
          {details.length ? (
            <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-2 text-small">
              {details.map((column) => (
                <div key={column.key} className="contents">
                  <dt className="text-ink-soft">{column.header}</dt>
                  <dd className="min-w-0 text-right break-words">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {actions ? (
            <div className="-mb-1 flex justify-end border-t border-line/80 pt-2">
              {actions.cell(row)}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Accessible table on tablet and up; a list of cards on phones. */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  caption,
  empty,
}: DataTableProps<T>): ReactElement {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <>
      <MobileCards rows={rows} columns={columns} rowKey={rowKey} caption={caption} />
      <div className="hidden overflow-x-auto rounded-md border border-line/80 bg-white shadow-soft md:block">
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
    </>
  );
}

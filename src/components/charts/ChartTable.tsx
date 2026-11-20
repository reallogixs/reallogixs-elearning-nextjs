import type { ReactElement } from "react";

interface ChartTableProps {
  caption: string;
  columns: [string, string];
  rows: [string, string][];
}

/** The table view every chart ships with: the same numbers, no hover needed. */
export function ChartTable({ caption, columns, rows }: ChartTableProps): ReactElement {
  return (
    <details className="group text-dash-meta text-ink-soft">
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-sm hover:text-ink">
        View as table
      </summary>
      <table className="mt-2 w-full text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-ink-soft">
            <th scope="col" className="py-2 font-medium">
              {columns[0]}
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              {columns[1]}
            </th>
          </tr>
        </thead>
        <tbody className="text-ink tabular-nums">
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-line/60">
              <td className="py-1.5">{label}</td>
              <td className="py-1.5 text-right">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

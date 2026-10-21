import type { ReactNode } from "react";
import { useTheme } from "../../theme/useTheme";
import type { TableProps } from "./types";
import "./Table.css";

export function Table<T = Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  color,
  striped = true,
  emptyText = "NO DATA",
  className,
  style,
}: TableProps<T>) {
  const { theme } = useTheme();
  const resolvedColor = color ?? theme.mainColor;

  return (
    <div
      className={["hdux-table-wrapper", className].filter(Boolean).join(" ")}
      style={{ "--hdux-table-color": resolvedColor, ...style } as React.CSSProperties}
    >
      <table className="hdux-table">
        <thead className="hdux-table-head">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="hdux-table-th"
                style={{
                  width:
                    col.width != null
                      ? typeof col.width === "number"
                        ? `${col.width}px`
                        : col.width
                      : undefined,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="hdux-table-body">
          {rows.length === 0 ? (
            <tr>
              <td className="hdux-table-empty" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={[
                  "hdux-table-tr",
                  striped && rowIdx % 2 === 1 ? "hdux-table-tr--alt" : "",
                  onRowClick ? "hdux-table-tr--clickable" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onRowClick?.(row, rowIdx)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="hdux-table-td">
                    {col.render
                      ? col.render(row[col.key as keyof T], row, rowIdx)
                      : (row[col.key as keyof T] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

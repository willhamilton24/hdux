import { useMemo, useState } from "react";
import { useTheme } from "../../../theme/useTheme";
import { ProGate } from "../../ProGate";
import type { DataGridColumn, DataGridProps, SortDirection } from "./types";
import "./DataGrid.css";

type Row = Record<string, unknown>;

function DataGridInner<T extends Row>({
  columns,
  rows,
  pageSize = 10,
  searchable = true,
  onRowClick,
  color,
  className,
  style,
}: DataGridProps<T>) {
  const { theme } = useTheme();
  const accent = color ?? theme.mainColor;

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages - 1);
  const visible =
    pageSize > 0 ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize) : sorted;

  function handleSort(col: DataGridColumn<T>) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div
      className={["hdux-datagrid", className].filter(Boolean).join(" ")}
      style={{ "--hdux-datagrid-accent": accent, ...style } as React.CSSProperties}
    >
      {searchable && (
        <div className="hdux-datagrid__toolbar">
          <input
            className="hdux-datagrid__search"
            type="text"
            placeholder="FILTER…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            aria-label="Filter rows"
          />
          <span className="hdux-datagrid__count">
            {filtered.length} / {rows.length}
          </span>
        </div>
      )}

      <div className="hdux-datagrid__scroll">
        <table className="hdux-datagrid__table" role="grid">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "hdux-datagrid__th",
                    col.sortable ? "hdux-datagrid__th--sortable" : "",
                    sortKey === col.key ? "hdux-datagrid__th--sorted" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => handleSort(col)}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.header}
                  {col.sortable && (
                    <span
                      className="hdux-datagrid__sort-icon"
                      aria-hidden="true"
                    >
                      {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : " ⬦"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td className="hdux-datagrid__empty" colSpan={columns.length}>
                  NO RESULTS
                </td>
              </tr>
            ) : (
              visible.map((row, ri) => (
                <tr
                  key={ri}
                  className={[
                    "hdux-datagrid__row",
                    onRowClick ? "hdux-datagrid__row--clickable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="hdux-datagrid__td">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && totalPages > 1 && (
        <div className="hdux-datagrid__pagination">
          <button
            className="hdux-datagrid__page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="hdux-datagrid__page-info">
            {safePage + 1} / {totalPages}
          </span>
          <button
            className="hdux-datagrid__page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export function DataGrid<T extends Record<string, unknown>>(props: DataGridProps<T>) {
  return (
    <ProGate componentName="DataGrid">
      <DataGridInner {...props} />
    </ProGate>
  );
}

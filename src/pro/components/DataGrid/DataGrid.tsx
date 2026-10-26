import { useCallback, useMemo, useRef, useState } from "react";
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
  loading = false,
  error = false,
  onRetry,
  loadingMessage = "LOADING…",
  errorMessage = "ERROR LOADING DATA",
  emptyMessage = "NO DATA",
  noMatchMessage = "NO RESULTS",
  defaultQuery = "",
}: DataGridProps<T>) {
  const { theme } = useTheme();
  const accent = color ?? theme.mainColor;

  const gridRef = useRef<HTMLTableElement>(null);
  const retryRef = useRef<HTMLButtonElement | null>(null);
  // React detaches the ref before removing the button, while focus is observable.
  const setRetryRef = useCallback((node: HTMLButtonElement | null) => {
    const previous = retryRef.current;
    if (!node && previous && previous.ownerDocument.activeElement === previous) {
      gridRef.current?.focus();
    }
    retryRef.current = node;
  }, []);

  const [query, setQuery] = useState(defaultQuery);
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

  const errorText = typeof error === "string" ? error : errorMessage;

  const statusAnnouncement = loading
    ? loadingMessage
    : error
    ? errorText
    : filtered.length === 0 && rows.length === 0
    ? emptyMessage
    : filtered.length === 0
    ? noMatchMessage
    : "";

  return (
    <div
      className={["hdux-datagrid", className].filter(Boolean).join(" ")}
      style={{ "--hdux-datagrid-accent": accent, ...style } as React.CSSProperties}
    >
      {/* Visually hidden live region so screen readers announce state changes */}
      <span role="status" aria-live="polite" className="hdux-datagrid__sr-status">
        {statusAnnouncement}
      </span>

      {searchable && !loading && !error && (
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
        <table ref={gridRef} className="hdux-datagrid__table" role="grid" aria-label="Data grid" tabIndex={-1}>
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
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (col.sortable && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      handleSort(col);
                    }
                  }}
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
            {loading ? (
              <tr>
                <td className="hdux-datagrid__loading" colSpan={columns.length} aria-hidden="true">
                  {loadingMessage}
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="hdux-datagrid__error-cell" colSpan={columns.length}>
                  <div className="hdux-datagrid__error">
                    <span>{errorText}</span>
                    {onRetry && (
                      <button
                        type="button"
                        ref={setRetryRef}
                        className="hdux-datagrid__retry-btn"
                        onClick={onRetry}
                      >
                        RETRY
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="hdux-datagrid__empty" colSpan={columns.length}>
                  {rows.length === 0 ? emptyMessage : noMatchMessage}
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

      {!loading && !error && pageSize > 0 && totalPages > 1 && (
        <div className="hdux-datagrid__pagination">
          <button
            className="hdux-datagrid__page-btn"
            onClick={() => setPage(Math.max(0, safePage - 1))}
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
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
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

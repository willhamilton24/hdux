import type { CSSProperties, ReactNode } from "react";

export interface DataGridColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: number;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export type SortDirection = "asc" | "desc";

export interface DataGridProps<T = Record<string, unknown>> {
  columns: DataGridColumn<T>[];
  rows: T[];
  /** Rows per page. Set to 0 to disable pagination. Default: 10 */
  pageSize?: number;
  /** Show search/filter bar */
  searchable?: boolean;
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Accent color override */
  color?: string;
  className?: string;
  style?: CSSProperties;
  /** Show a loading indicator instead of rows */
  loading?: boolean;
  /** Show an error state; pass a string for a custom message */
  error?: boolean | string;
  /** Called when the retry button in the error state is clicked */
  onRetry?: () => void;
  /** Message shown while loading. Default: "LOADING…" */
  loadingMessage?: string;
  /** Fallback error message used when error={true} (no string). Default: "ERROR LOADING DATA" */
  errorMessage?: string;
  /** Message shown when rows is empty and not loading/erroring. Default: "NO DATA" */
  emptyMessage?: string;
  /** Message shown when a filter produces zero matches. Default: "NO RESULTS" */
  noMatchMessage?: string;
  /** Pre-fills the search input (useful for testing/stories) */
  defaultQuery?: string;
}

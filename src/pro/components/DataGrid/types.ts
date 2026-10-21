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
}

import type { CSSProperties, ReactNode } from "react";

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: string | number;
  /** Custom cell renderer */
  render?: (value: T[keyof T], row: T, rowIndex: number) => ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  rows: T[];
  /** Makes rows tabbable and activates them on click, Enter, or Space. */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Override the accent color */
  color?: string;
  /** Zebra-stripe alternating rows (default true) */
  striped?: boolean;
  /** Message shown when rows is empty */
  emptyText?: string;
  className?: string;
  style?: CSSProperties;
}

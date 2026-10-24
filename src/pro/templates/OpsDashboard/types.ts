import type { CSSProperties } from "react";

export interface OpsMetric {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
}

export interface OpsChartSeries {
  label: string;
  data: number[];
  color?: string;
}

export interface OpsTableRow {
  id: string | number;
  [key: string]: unknown;
}

export interface OpsServiceNode {
  name: string;
  status: "ok" | "warn" | "err";
}

export interface OpsDashboardProps {
  /** Show sample data for omitted props. Supplied data always takes precedence. */
  demoMode?: boolean;
  /** Service health used by the map and status totals. */
  serviceNodes?: OpsServiceNode[];
  /** Dashboard title shown in the top bar */
  title?: string;
  /** System/app name shown alongside the title */
  systemName?: string;
  /** Gauge metrics for the cluster panel */
  metrics?: OpsMetric[];
  /** Time-series data for the area charts */
  chartSeries?: OpsChartSeries[];
  /** X-axis labels shared across all chart series */
  chartLabels?: string[];
  /** Rows shown in the events/log table */
  tableRows?: OpsTableRow[];
  className?: string;
  style?: CSSProperties;
}

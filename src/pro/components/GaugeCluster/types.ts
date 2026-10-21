import type { CSSProperties } from "react";

export interface GaugeSpec {
  label: string;
  value: number;
  min?: number;
  max?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export interface GaugeClusterProps {
  gauges: GaugeSpec[];
  /** Number of columns in the grid. Defaults to auto (up to 4). */
  columns?: number;
  /** Size of each gauge in px. Default: 100 */
  gaugeSize?: number;
  /** Cluster title */
  title?: string;
  /**
   * Show an aggregate health bar below the cluster.
   * "min" uses the lowest gauge percentage; "avg" uses the mean.
   * Default: "avg"
   */
  healthAggregation?: "min" | "avg" | false;
  className?: string;
  style?: CSSProperties;
}

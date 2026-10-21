import type { CSSProperties } from "react";

export interface AreaChartDataPoint {
  /** X-axis label (tick label) */
  label?: string;
  /** Numeric value */
  value: number;
}

export interface AreaChartSeries {
  id: string;
  label?: string;
  data: AreaChartDataPoint[];
  color?: string;
}

export interface AreaChartProps {
  /**
   * One or more data series. Single-series shorthand: pass `data` directly.
   */
  series?: AreaChartSeries[];
  /** Shorthand: single-series data array */
  data?: AreaChartDataPoint[] | number[];
  /** Label used in single-series mode */
  label?: string;
  /** Accent color (defaults to theme mainColor) */
  color?: string;
  width?: number;
  height?: number;
  /** Show horizontal grid lines */
  showGrid?: boolean;
  /** Show X-axis tick labels */
  showXLabels?: boolean;
  /** Show Y-axis value labels */
  showYLabels?: boolean;
  /** Animate the line drawing on mount */
  animate?: boolean;
  /** Show a dot on each data point */
  showDots?: boolean;
  /** Chart title */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

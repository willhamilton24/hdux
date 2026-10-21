import type { CSSProperties } from "react";

export interface RadialMeterProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  /** Override the arc color */
  color?: string;
  /** Outer diameter in px (default 120) */
  size?: number;
  /** Arc stroke width in px (default 6) */
  strokeWidth?: number;
  /** Show numeric value in center (default true) */
  showValue?: boolean;
  /** Custom formatter for the center value */
  formatValue?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
}

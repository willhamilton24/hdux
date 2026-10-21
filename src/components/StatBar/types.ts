import type { CSSProperties } from "react";

export interface StatBarProps {
  /** Current value */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  label?: string;
  /** Override the fill color */
  color?: string;
  /** Bar height in px (default 8) */
  height?: number;
  /** Animate the fill on value change (default true) */
  animated?: boolean;
  /**
   * Display the value as text.
   * true → "value/max", "percent" → "XX%"
   */
  showValue?: boolean | "percent";
  className?: string;
  style?: CSSProperties;
}

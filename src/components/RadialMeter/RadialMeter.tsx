import { useTheme } from "../../theme/useTheme";
import type { RadialMeterProps } from "./types";
import "./RadialMeter.css";

// Arc spans 240° with a 120° gap at the bottom.
// Start: 150° clockwise from 12 o'clock (= 60° clockwise from 3 o'clock in SVG).
const ARC_DEG = 240;
const START_FROM_3_OCL_DEG = 60; // degrees clockwise from the SVG default (3 o'clock)

export function RadialMeter({
  value,
  min = 0,
  max = 100,
  label,
  color,
  size = 120,
  strokeWidth = 6,
  showValue = true,
  formatValue,
  className,
  style,
}: RadialMeterProps) {
  const { theme } = useTheme();
  const resolvedColor = color ?? theme.mainColor;

  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));

  const radius = size / 2 - strokeWidth - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Track spans ARC_DEG degrees; remainder is the bottom gap
  const trackLen = circumference * (ARC_DEG / 360);
  const fillLen = trackLen * pct;

  // Shift the dash start from 3 o'clock to our desired start angle
  const dashOffset = -(circumference * (START_FROM_3_OCL_DEG / 360));

  const centerY = label ? cy - 8 : cy + 5;

  const displayValue = formatValue
    ? formatValue(value)
    : String(Math.round(value));

  return (
    <div
      className={["hdux-radial-meter", className].filter(Boolean).join(" ")}
      style={{ "--hdux-radial-color": resolvedColor, ...style } as React.CSSProperties}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="hdux-radial-svg"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        {/* Track (faint full arc) */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${trackLen} ${circumference}`}
          strokeDashoffset={dashOffset}
          opacity={0.15}
          strokeLinecap="butt"
        />

        {/* Fill arc */}
        {pct > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLen} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            className="hdux-radial-fill"
          />
        )}

        {/* Center value */}
        {showValue && (
          <text
            x={cx}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="hdux-radial-value"
            fill={resolvedColor}
            fontSize={size * 0.185}
          >
            {displayValue}
          </text>
        )}

        {/* Label below value */}
        {label && (
          <text
            x={cx}
            y={centerY + size * 0.185 * 0.7 + 6}
            textAnchor="middle"
            className="hdux-radial-label"
            fill={resolvedColor}
            fontSize={size * 0.078}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

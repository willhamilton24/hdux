import type { CSSProperties } from "react";
import { useTheme } from "../../theme/useTheme";
import type { HduxThemeMode } from "../../theme/types";
import "./ThemeSelector.css";

export interface ThemeSelectorProps {
  /** Override the border/line color (defaults to theme mainColor) */
  color?: string;
  /** Size of the square in px (default 32) */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/*
 * Triangle geometry (viewBox 0 0 100 100):
 *
 *   Top vertex: (50, 10)           ← custom
 *   Bottom-left vertex: (10, 90)   ← light
 *   Bottom-right vertex: (90, 90)  ← dark
 *
 * Each side has a gap at the vertices (~18% cut from each end).
 * The active mode fills in its corner with a solid triangle.
 */

// Full triangle vertices
const TOP = { x: 50, y: 10 };
const BL = { x: 10, y: 90 };
const BR = { x: 90, y: 90 };

// Gap fraction — how much of each side to cut from each end
const GAP = 0.18;

type Pt = { x: number; y: number };

const STROKE_WIDTH = 4;

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function dist(a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Shift a point along the direction from `from` toward `to` by `amount` units */
function shift(pt: Pt, from: Pt, to: Pt, amount: number): Pt {
  const d = dist(from, to);
  return { x: pt.x + ((to.x - from.x) / d) * amount, y: pt.y + ((to.y - from.y) / d) * amount };
}

// Center of the main triangle
const CENTER: Pt = {
  x: (TOP.x + BL.x + BR.x) / 3,
  y: (TOP.y + BL.y + BR.y) / 3,
};

// Line segment endpoints (inner edges of each gap)
const leftNearTop = lerp(TOP, BL, GAP);
const leftNearBL = lerp(TOP, BL, 1 - GAP);
const rightNearTop = lerp(TOP, BR, GAP);
const rightNearBR = lerp(TOP, BR, 1 - GAP);
const bottomNearBL = lerp(BL, BR, GAP);
const bottomNearBR = lerp(BL, BR, 1 - GAP);

// Outer edges of each gap — shift each endpoint toward its vertex by half stroke width
// (accounts for the round cap extending half stroke beyond the center-line endpoint)
const outerLeftNearTop = shift(leftNearTop, BL, TOP, STROKE_WIDTH / 2);
const outerRightNearTop = shift(rightNearTop, BR, TOP, STROKE_WIDTH / 2);
const outerLeftNearBL = shift(leftNearBL, TOP, BL, STROKE_WIDTH / 2);
const outerBottomNearBL = shift(bottomNearBL, BR, BL, STROKE_WIDTH / 2);
const outerBottomNearBR = shift(bottomNearBR, BL, BR, STROKE_WIDTH / 2);
const outerRightNearBR = shift(rightNearBR, TOP, BR, STROKE_WIDTH / 2);

/**
 * Build an equilateral indicator triangle for a corner:
 * - Base sits at the outer edges of the gap (vertex side of the stroke caps)
 * - Apex is placed on the perpendicular bisector of the base,
 *   at height = (baseLength * √3) / 2 * 3, pointing inward
 */
function buildIndicator(outerPt1: Pt, outerPt2: Pt): string {
  const mid: Pt = { x: (outerPt1.x + outerPt2.x) / 2, y: (outerPt1.y + outerPt2.y) / 2 };
  const dx = outerPt2.x - outerPt1.x;
  const dy = outerPt2.y - outerPt1.y;
  const baseLen = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular unit vector — pick the direction pointing toward center
  const perpA: Pt = { x: -dy / baseLen, y: dx / baseLen };
  const toCenter: Pt = { x: CENTER.x - mid.x, y: CENTER.y - mid.y };
  const dot = perpA.x * toCenter.x + perpA.y * toCenter.y;
  const perp = dot > 0 ? perpA : { x: -perpA.x, y: -perpA.y };

  const height = (baseLen * Math.sqrt(3)) / 2 * 2.2;
  const apex: Pt = { x: mid.x + perp.x * height, y: mid.y + perp.y * height };

  return `${outerPt1.x},${outerPt1.y} ${outerPt2.x},${outerPt2.y} ${apex.x},${apex.y}`;
}

// Corner indicator triangles (filled), base at outer gap edges, pointing inward
const CORNER_INDICATORS: Record<HduxThemeMode, string> = {
  custom: buildIndicator(outerLeftNearTop, outerRightNearTop),
  light: buildIndicator(outerLeftNearBL, outerBottomNearBL),
  dark: buildIndicator(outerBottomNearBR, outerRightNearBR),
};

// Mode corner positions for click targets (as CSS percentage for hit areas)
const MODE_ORDER: HduxThemeMode[] = ["light", "dark", "custom"];

export function ThemeSelector({
  color,
  size = 32,
  className,
  style,
}: ThemeSelectorProps) {
  const { theme, mode, setMode, availableModes } = useTheme();
  const lineColor = color ?? theme.mainColor;

  function cycleMode() {
    const available = availableModes.length > 0 ? availableModes : MODE_ORDER;
    const idx = available.indexOf(mode);
    const next = available[(idx + 1) % available.length];
    setMode(next);
  }

  const classes = ["hdux-theme-selector"];
  if (className) classes.push(className);

  return (
    <div
      className={classes.join(" ")}
      onClick={cycleMode}
      title={`Theme: ${mode}`}
      style={
        {
          "--hdux-selector-color": lineColor,
          "--hdux-selector-size": `${size}px`,
          ...style,
        } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Three sides with gaps at vertices */}
        <line
          x1={leftNearTop.x} y1={leftNearTop.y}
          x2={leftNearBL.x} y2={leftNearBL.y}
          stroke={lineColor} strokeWidth="4" strokeLinecap="round"
        />
        <line
          x1={bottomNearBL.x} y1={bottomNearBL.y}
          x2={bottomNearBR.x} y2={bottomNearBR.y}
          stroke={lineColor} strokeWidth="4" strokeLinecap="round"
        />
        <line
          x1={rightNearBR.x} y1={rightNearBR.y}
          x2={rightNearTop.x} y2={rightNearTop.y}
          stroke={lineColor} strokeWidth="4" strokeLinecap="round"
        />

        {/* Active corner indicator — solid filled triangle */}
        <polygon
          points={CORNER_INDICATORS[mode]}
          fill={lineColor}
        />
      </svg>
    </div>
  );
}

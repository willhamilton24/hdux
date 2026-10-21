import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../theme/useTheme";
import type { StatBarProps } from "./types";
import "./StatBar.css";

export function StatBar({
  value,
  max = 100,
  label,
  color,
  height = 8,
  animated = true,
  showValue = false,
  className,
  style,
}: StatBarProps) {
  const { theme } = useTheme();
  const resolvedColor = color ?? theme.mainColor;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const [displayPct, setDisplayPct] = useState(animated ? 0 : pct);
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!animated) {
      setDisplayPct(pct);
      return;
    }
    const from = fromRef.current;
    const to = pct;
    const duration = 700;
    startTimeRef.current = undefined;

    const tick = (now: number) => {
      if (startTimeRef.current == null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayPct(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [pct, animated]);

  const valueLabel =
    showValue === "percent"
      ? `${Math.round(pct)}%`
      : showValue
        ? `${value}/${max}`
        : null;

  return (
    <div
      className={["hdux-statbar", className].filter(Boolean).join(" ")}
      style={
        {
          "--hdux-statbar-color": resolvedColor,
          "--hdux-statbar-height": `${height}px`,
          ...style,
        } as React.CSSProperties
      }
    >
      {(label || valueLabel) && (
        <div className="hdux-statbar-meta">
          {label && <span className="hdux-statbar-label">{label}</span>}
          {valueLabel && (
            <span className="hdux-statbar-value">{valueLabel}</span>
          )}
        </div>
      )}
      <div
        className="hdux-statbar-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="hdux-statbar-fill"
          style={{ width: `${displayPct}%` }}
        />
        <div className="hdux-statbar-tick hdux-statbar-tick--25" />
        <div className="hdux-statbar-tick hdux-statbar-tick--50" />
        <div className="hdux-statbar-tick hdux-statbar-tick--75" />
      </div>
    </div>
  );
}

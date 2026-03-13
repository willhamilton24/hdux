import { useRef, useCallback, useEffect } from "react";
import { useTheme } from "../../theme/useTheme";
import type { ButtonProps } from "./types";
import "./Button.css";

const CONVERGE_DURATION = 400; // ms — must match CSS animation duration

export function Button({
  children,
  color,
  textColor,
  cornerColor,
  cornerLength,
  cornerWidth,
  disabled = false,
  onClick,
  className,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const resolvedCornerColor = cornerColor ?? color ?? theme.mainColor;
  const resolvedTextColor = textColor ?? color ?? theme.textColor;
  const resolvedCornerLen = cornerLength
    ? `${cornerLength}px`
    : theme.boxCorners.length;
  const resolvedCornerWid = cornerWidth
    ? `${cornerWidth}px`
    : theme.boxCorners.width;

  const triggerConverge = useCallback(() => {
    const el = buttonRef.current;
    if (!el || disabled) return;

    clearTimeout(timeoutRef.current);

    const rect = el.getBoundingClientRect();
    const cornerLen =
      parseFloat(
        getComputedStyle(el).getPropertyValue("--hdux-box-corner-len")
      ) || 12;

    // Vertical convergence: stop short of center
    const gap = 6;
    const cy = Math.max(0, rect.height / 2 - cornerLen - gap);
    el.style.setProperty("--hdux-btn-cy", `${cy}px`);

    // Re-trigger animation
    el.classList.remove("hdux-btn--converging");
    void el.offsetWidth;
    el.classList.add("hdux-btn--converging");

    timeoutRef.current = setTimeout(() => {
      el.classList.remove("hdux-btn--converging");
    }, CONVERGE_DURATION + 50);
  }, [disabled]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === " " || e.key === "Enter") {
        triggerConverge();
      }
    },
    [triggerConverge]
  );

  const classes = ["hdux-btn"];
  if (disabled) classes.push("hdux-btn--disabled");
  if (className) classes.push(className);

  return (
    <button
      ref={buttonRef}
      className={classes.join(" ")}
      onMouseDown={triggerConverge}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      disabled={disabled}
      style={
        {
          "--hdux-box-corner-color": resolvedCornerColor,
          "--hdux-box-text-color": resolvedTextColor,
          "--hdux-box-corner-len": resolvedCornerLen,
          "--hdux-box-corner-wid": resolvedCornerWid,
          ...style,
        } as React.CSSProperties
      }
    >
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div key={pos} className={`hdux-btn-corner hdux-btn-corner--${pos}`}>
          <div className="hdux-btn-corner-h" />
          <div className="hdux-btn-corner-v" />
        </div>
      ))}
      <span className="hdux-btn-text">{children}</span>
    </button>
  );
}

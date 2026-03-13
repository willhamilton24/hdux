import { useRef, useCallback } from "react";
import { useTheme } from "../../theme/useTheme";
import type { BarButtonProps } from "./types";

const PULSE_DURATION = 400; // ms — must match CSS animation duration

export function BarButton({
  children,
  color,
  textColor,
  background,
  borderless = false,
  onClick,
  className,
  style,
}: BarButtonProps) {
  const { theme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClick = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    clearTimeout(timeoutRef.current);
    el.classList.remove("hdux-bar-button--pulsing");
    void el.offsetWidth;
    el.classList.add("hdux-bar-button--pulsing");

    timeoutRef.current = setTimeout(() => {
      el.classList.remove("hdux-bar-button--pulsing");
    }, PULSE_DURATION + 50);

    onClick?.();
  }, [onClick]);

  const classes = ["hdux-bar-element", "hdux-bar-button"];
  if (borderless) classes.push("hdux-bar-element--borderless");
  if (className) classes.push(className);

  return (
    <button
      ref={ref}
      className={classes.join(" ")}
      onClick={handleClick}
      style={
        {
          "--hdux-bar-element-color": color ?? undefined,
          "--hdux-bar-element-text-color": textColor ?? theme.textColor,
          "--hdux-bar-element-bg": background ?? undefined,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </button>
  );
}

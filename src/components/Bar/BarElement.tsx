import { useTheme } from "../../theme/useTheme";
import type { BarElementProps } from "./types";

export function BarElement({
  children,
  color,
  textColor,
  background,
  borderless = false,
  onClick,
  className,
  style,
}: BarElementProps) {
  const { theme } = useTheme();

  const classes = ["hdux-bar-element"];
  if (borderless) classes.push("hdux-bar-element--borderless");
  if (onClick) classes.push("hdux-bar-element--clickable");
  if (className) classes.push(className);

  return (
    <div
      className={classes.join(" ")}
      onClick={onClick}
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
    </div>
  );
}

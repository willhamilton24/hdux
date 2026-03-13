import { Children, isValidElement } from "react";
import { useTheme } from "../../theme/useTheme";
import { BarLeft, BarCenter, BarRight } from "./BarSections";
import type { TopBarProps } from "./types";
import "./Bar.css";

const SECTION_TYPES = [BarLeft, BarCenter, BarRight] as const;

export function TopBar({
  children,
  color,
  background,
  static: isStatic = false,
  className,
  style,
}: TopBarProps) {
  const { theme } = useTheme();

  const { hasLeft, hasCenter, hasRight } = detectSections(children);

  const classes = [
    "hdux-bar",
    "hdux-bar--top",
    isStatic ? "hdux-bar--static" : "hdux-bar--fixed",
  ];
  if (hasLeft) classes.push("hdux-bar--has-left");
  if (hasCenter) classes.push("hdux-bar--has-center");
  if (hasRight) classes.push("hdux-bar--has-right");
  if (className) classes.push(className);

  return (
    <div
      className={classes.join(" ")}
      style={
        {
          "--hdux-bar-color": color ?? theme.mainColor,
          "--hdux-bar-bg": background ?? theme.background,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

function detectSections(children: React.ReactNode) {
  let hasLeft = false;
  let hasCenter = false;
  let hasRight = false;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === BarLeft) hasLeft = true;
    if (child.type === BarCenter) hasCenter = true;
    if (child.type === BarRight) hasRight = true;
  });

  return { hasLeft, hasCenter, hasRight };
}

// Re-export so users can import section types from the same place
TopBar._sectionTypes = SECTION_TYPES;

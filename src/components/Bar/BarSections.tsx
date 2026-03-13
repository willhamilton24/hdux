import type { BarSectionProps } from "./types";

export function BarLeft({ children, className, style }: BarSectionProps) {
  const classes = ["hdux-bar-section", "hdux-bar-section--left"];
  if (className) classes.push(className);
  return (
    <div className={classes.join(" ")} style={style}>
      {children}
    </div>
  );
}

export function BarCenter({ children, className, style }: BarSectionProps) {
  const classes = ["hdux-bar-section", "hdux-bar-section--center"];
  if (className) classes.push(className);
  return (
    <div className={classes.join(" ")} style={style}>
      {children}
    </div>
  );
}

export function BarRight({ children, className, style }: BarSectionProps) {
  const classes = ["hdux-bar-section", "hdux-bar-section--right"];
  if (className) classes.push(className);
  return (
    <div className={classes.join(" ")} style={style}>
      {children}
    </div>
  );
}

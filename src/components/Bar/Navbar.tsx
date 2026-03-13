import { useTheme } from "../../theme/useTheme";
import type { NavbarProps } from "./types";
import "./Navbar.css";

export function Navbar({
  items,
  active,
  onNavigate,
  cornerColor,
  textColor,
  borderless = true,
  className,
  style,
}: NavbarProps) {
  const { theme } = useTheme();

  const resolvedTextColor = textColor ?? theme.textColor;
  const resolvedCornerColor = cornerColor ?? theme.mainColor;

  const classes = [
    "hdux-bar-element",
    "hdux-navbar",
  ];
  if (borderless) classes.push("hdux-bar-element--borderless");
  if (className) classes.push(className);

  return (
    <nav
      className={classes.join(" ")}
      style={
        {
          "--hdux-bar-element-text-color": resolvedTextColor,
          "--hdux-navbar-corner-color": resolvedCornerColor,
          ...style,
        } as React.CSSProperties
      }
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            className={`hdux-navbar-item${isActive ? " hdux-navbar-item--active" : ""}`}
            onClick={() => onNavigate?.(item.key)}
          >
            <span className="hdux-navbar-label">
              {isActive && (["tl", "tr", "bl", "br"] as const).map((pos) => (
                <span key={pos} className={`hdux-navbar-corner hdux-navbar-corner--${pos}`}>
                  <span className="hdux-navbar-corner-h" />
                  <span className="hdux-navbar-corner-v" />
                </span>
              ))}
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

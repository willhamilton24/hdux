import type { ReactNode, CSSProperties } from "react";

export type BarPosition = "top" | "bottom";

export interface TopBarProps {
  children?: ReactNode;
  /** Override the border/element color (defaults to theme mainColor) */
  color?: string;
  /** Override the background (defaults to theme background) */
  background?: string;
  /** Disable fixed positioning */
  static?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface BottomBarProps {
  children?: ReactNode;
  /** Override the border/element color (defaults to theme mainColor) */
  color?: string;
  /** Override the background (defaults to theme background) */
  background?: string;
  /** Disable fixed positioning */
  static?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface BarSectionProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface BarElementProps {
  children?: ReactNode;
  /** Override border color (defaults to parent bar color / theme mainColor) */
  color?: string;
  /** Override text color (defaults to theme textColor) */
  textColor?: string;
  /** Background color (defaults to transparent) */
  background?: string;
  /** Remove side borders */
  borderless?: boolean;
  /** Click handler */
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export interface NavbarItem {
  key: string;
  label: string;
}

export interface NavbarProps {
  items: NavbarItem[];
  /** Key of the active page */
  active?: string;
  /** Called when a nav item is clicked */
  onNavigate?: (key: string) => void;
  /** Override corner color for the active indicator */
  cornerColor?: string;
  /** Override text color */
  textColor?: string;
  /** Remove side borders on the outer element */
  borderless?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface BarButtonProps {
  children?: ReactNode;
  /** Override border color (defaults to parent bar color / theme mainColor) */
  color?: string;
  /** Override text color (defaults to theme textColor) */
  textColor?: string;
  /** Background color (defaults to transparent) */
  background?: string;
  /** Remove side borders */
  borderless?: boolean;
  /** Click handler */
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

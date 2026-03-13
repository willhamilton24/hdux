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

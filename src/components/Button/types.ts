import type { ReactNode, CSSProperties, MouseEvent } from "react";

export interface ButtonProps {
  children?: ReactNode;
  /** Color for corners & text, overridden by specific color props */
  color?: string;
  /** Color for text, overrides color */
  textColor?: string;
  /** Color for corners, overrides color */
  cornerColor?: string;
  /** Corner decoration length in px */
  cornerLength?: number;
  /** Corner decoration width in px */
  cornerWidth?: number;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: CSSProperties;
}

import type { CSSProperties, ReactNode } from "react";

export type TextAnimation = "none" | "print" | "sweep";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subheading"
  | "body";

export interface TextProps {
  children?: ReactNode;
  animation?: TextAnimation;
  color?: string;
  fontSize?: string | number;
  fontFamily?: string;
  /** Pull font size & family from theme. Overridden by manual fontSize/fontFamily. */
  variant?: TextVariant;
  className?: string;
  style?: CSSProperties;
}

/** Default font sizes for each variant */
export const VARIANT_FONT_SIZES: Record<TextVariant, string> = {
  h1: "2.5rem",
  h2: "2rem",
  h3: "1.75rem",
  h4: "1.5rem",
  h5: "1.25rem",
  h6: "1rem",
  subheading: "0.875rem",
  body: "1rem",
};

/** Default font weights for each variant */
export const VARIANT_FONT_WEIGHTS: Record<TextVariant, number> = {
  h1: 700,
  h2: 700,
  h3: 600,
  h4: 600,
  h5: 600,
  h6: 600,
  subheading: 500,
  body: 400,
};

/** Map variant to HTML element tag */
export const VARIANT_ELEMENTS: Record<TextVariant, keyof HTMLElementTagNameMap> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subheading: "p",
  body: "p",
};

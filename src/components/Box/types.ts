import type { ReactNode, CSSProperties } from "react";

export type BoxAnimationMode =
  | "static"
  | "standard"
  | "verticalFirst"
  | "horizontalFirst";

export interface PulseConfig {
  /** Duration of pulse in each direction in ms */
  duration?: number;
  /** Duration between each pulse cycle in ms */
  delayBetween?: number;
}

export interface BlinkConfig {
  /** Number of blink iterations (default 1, max 4) */
  iterations?: number;
}

export interface CornerBoxLoadingAnimationConfig {
  /** Rhythmic pulse of loadingText opacity while loading */
  textPulse?: PulseConfig;
  /** Rhythmic pulse of corners opacity while loading */
  cornerPulse?: PulseConfig;
  /** Corners fade in/out sequentially like a loading spinner */
  cornerSpin?: PulseConfig;
  /** Text blinks before disappearing */
  textBlink?: BlinkConfig;
  /** Corners blink before starting traverse */
  cornerBlinkStart?: BlinkConfig;
  /** Corners blink after finishing traverse */
  cornerBlinkEnd?: BlinkConfig;
  /** Loaded content blinks before settling */
  contentBlink?: BlinkConfig;
}

/** Placeholder for future error panel functionality */
export interface BoxErrorPanelConfig {
  // To be developed
}

export interface BoxProps {
  animation?: BoxAnimationMode;
  loadingText?: string;
  hideLoadingText?: boolean;
  hasLoaded?: boolean;
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
  loadingAnimations?: CornerBoxLoadingAnimationConfig;
  /** Extend corner lines to form a full border after animations settle */
  fullBorder?: boolean;
  children?: ReactNode;
  /** To be developed */
  errorText?: string;
  /** To be developed */
  errorPanelConfig?: BoxErrorPanelConfig;
  className?: string;
  style?: CSSProperties;
}

export type AnimationPhase =
  | "idle"
  | "loading"
  | "text-blink"
  | "corner-blink-start"
  | "traverse-phase-1"
  | "traverse-phase-2"
  | "corner-blink-end"
  | "content-reveal"
  | "full-border"
  | "settled";

export type CornerPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

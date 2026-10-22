import type { CSSProperties } from "react";

export interface LandingFeature {
  label: string;
  description: string;
  stat?: string;
}

export interface LandingStats {
  label: string;
  value: string;
}

export interface LandingPageProps {
  /** Main product headline */
  headline?: string;
  /** Short tagline below the headline */
  tagline?: string;
  /** Brand/system name in the top bar */
  brandName?: string;
  /** Primary CTA label */
  ctaLabel?: string;
  /** Called when the CTA is clicked */
  onCtaClick?: () => void;
  /** Features shown in the three-column grid */
  features?: LandingFeature[];
  /** Stats strip below the hero */
  stats?: LandingStats[];
  /** Override accent color */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

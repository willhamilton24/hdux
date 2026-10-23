import type { CSSProperties } from "react";

export interface LandingPageProps {
  /** Product name shown in the hero (default: "HDUX") */
  productName?: string;
  /** One-line tagline (default: "THE HUD FRAMEWORK FOR REACT") */
  tagline?: string;
  /** Sub-tagline (default: "Sci-fi HUD components for dashboards, games, and tools.") */
  subTagline?: string;
  /** Href for the "Get Free" button */
  freeUrl?: string;
  /**
   * Href for the "Buy Pro" CTA.
   * If omitted the landing page calls the checkout API directly.
   */
  proUrl?: string;
  className?: string;
  style?: CSSProperties;
}

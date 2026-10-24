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
  /** Product name shown in the hero (default: "HDUX") */
  productName?: string;
  /** Sub-tagline (default: "Sci-fi HUD components for dashboards, games, and tools.") */
  subTagline?: string;
  /** Explicit absolute HTTP(S) destination for "Get Free". Disabled with an explanation when absent or invalid. */
  freeUrl?: string;
  /**
   * Href for the "Buy Pro" CTA.
   * Absolute HTTP(S) destination, taking precedence over serviceUrl. Unsafe URLs are rejected.
   * Without either destination or serviceUrl, checkout is disabled with an explanation.
   */
  proUrl?: string;
  /**
   * Explicit HTTP(S) base URL of the consuming app's existing Stripe license service.
   * POSTs to /v1/checkout/session with cancel_url; expects { url: string }.
   * Network, HTTP, and invalid response failures are announced and can be retried.
   * No default service or public destination is assumed.
   */
  serviceUrl?: string;
  /** Main product headline */
  headline?: string;
  /** Short tagline below the headline */
  tagline?: string;
  /** Brand/system name in the top bar */
  brandName?: string;
  /** Primary CTA label */
  ctaLabel?: string;
  /** Start checkout using the host application's environment-backed integration.
   * Takes precedence over proUrl and serviceUrl when supplied.
   * Reject on failure; the template displays feedback and prevents duplicate requests. */
  onCtaClick?: () => void | Promise<void>;
  /** Features shown in the three-column grid */
  features?: LandingFeature[];
  /** Stats strip below the hero */
  stats?: LandingStats[];
  /** Override accent color */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

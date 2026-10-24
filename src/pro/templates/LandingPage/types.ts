import type { CSSProperties } from "react";

export interface LandingPageProps {
  /** Product name shown in the hero (default: "HDUX") */
  productName?: string;
  /** One-line tagline (default: "THE HUD FRAMEWORK FOR REACT") */
  tagline?: string;
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
  className?: string;
  style?: CSSProperties;
}

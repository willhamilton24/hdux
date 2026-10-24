import { useProLicense } from "./ProContext";
import "./SupportFunding.css";

/** Fail closed: only Stripe-hosted test Payment Links are accepted. */
export function testSupportLink(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.origin === "https://buy.stripe.com" &&
        !url.username && !url.password && /^\/test_[A-Za-z0-9]+$/.test(url.pathname) &&
        !url.search && !url.hash) return url.href;
  } catch { /* Missing or invalid configuration hides the entire section. */ }
  return undefined;
}

export function SupportFunding() {
  const { supportPaymentLink } = useProLicense();
  const href = testSupportLink(supportPaymentLink);
  if (!href) return null;
  return (
    <section className="hdux-support" aria-label="Voluntary support">
      <p>Voluntary support for HDUX development. Does not grant a Pro license.</p>
      <a href={href} target="_blank" rel="noopener noreferrer">
        Support via Stripe (test mode; opens a new tab)
      </a>
    </section>
  );
}

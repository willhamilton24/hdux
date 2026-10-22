import { useState, type ReactNode } from "react";
import { useProLicense } from "./ProContext";
import "./ProGate.css";

interface ProGateProps {
  componentName: string;
  children: ReactNode;
}

const CHECKOUT_ENDPOINT = "https://api.hdux.dev/v1/checkout/session";

function BuyButton() {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const here = typeof window !== "undefined" ? window.location.href : "https://hdux.dev";
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_url: here }),
      });
      if (!res.ok) {
        throw new Error(`Checkout request failed: ${res.status}`);
      }
      const data = (await res.json()) as { url?: string };
      if (data.url && typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch {
      // Swallow and fall through to re-enable the button
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="hdux-pro-gate__buy"
      onClick={() => void handleBuy()}
      disabled={loading}
    >
      {loading ? "LOADING…" : "BUY HDUX PRO →"}
    </button>
  );
}

/**
 * Renders children when a valid Pro license is active; otherwise shows
 * an unlock prompt overlaid on a blurred preview of the component.
 */
export function ProGate({ componentName, children }: ProGateProps) {
  const { status } = useProLicense();

  if (status === "valid") {
    return <>{children}</>;
  }

  const message =
    status === "validating"
      ? "VALIDATING LICENSE…"
      : "HDUX PRO — LICENSE REQUIRED";

  const sub =
    status === "validating"
      ? null
      : `${componentName} is a Pro component.`;

  return (
    <div className="hdux-pro-gate" aria-label={`${componentName} — Pro license required`}>
      <div className="hdux-pro-gate__preview" aria-hidden="true">
        {children}
      </div>
      <div className="hdux-pro-gate__overlay">
        <div className="hdux-pro-gate__badge">
          <span className="hdux-pro-gate__title">{message}</span>
          {sub && <span className="hdux-pro-gate__sub">{sub}</span>}
          {status !== "validating" && <BuyButton />}
        </div>
      </div>
    </div>
  );
}

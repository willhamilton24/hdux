import { type ReactNode } from "react";
import { useProLicense } from "./ProContext";
import "./ProGate.css";
import { SupportFunding } from "./SupportFunding";

interface ProGateProps {
  componentName: string;
  children: ReactNode;
}

function BuyButton() {
  const { checkoutUrl } = useProLicense();
  if (!checkoutUrl) return null;
  try {
    const url = new URL(checkoutUrl);
    if (url.username || url.password || !(url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))) return null;
  } catch { return null; }
  // Top-level navigation uses the service's GET route, without cross-origin fetch.
  return <a className="hdux-pro-gate__buy" href={checkoutUrl}>BUY HDUX PRO →</a>;
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
      <div className="hdux-pro-gate__preview" aria-hidden="true" {...{ inert: "" }}>
        {children}
      </div>
      <div className="hdux-pro-gate__overlay">
        <div className="hdux-pro-gate__badge">
          <span className="hdux-pro-gate__title">{message}</span>
          {sub && <span className="hdux-pro-gate__sub">{sub}</span>}
          {status !== "validating" && (
            <div className="hdux-pro-gate__buttons">
              <BuyButton />
              <SupportFunding />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

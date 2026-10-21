import type { ReactNode } from "react";
import { useProLicense } from "./ProContext";
import "./ProGate.css";

interface ProGateProps {
  componentName: string;
  children: ReactNode;
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
      : `${componentName} is a Pro component. Get a key at hdux.dev/pro`;

  return (
    <div className="hdux-pro-gate" aria-label={`${componentName} — Pro license required`}>
      <div className="hdux-pro-gate__preview" aria-hidden="true">
        {children}
      </div>
      <div className="hdux-pro-gate__overlay">
        <div className="hdux-pro-gate__badge">
          <span className="hdux-pro-gate__title">{message}</span>
          {sub && <span className="hdux-pro-gate__sub">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

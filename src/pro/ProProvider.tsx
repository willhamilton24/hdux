import { useEffect, useState, type ReactNode } from "react";
import { HduxProContext, type ProLicenseStatus } from "./ProContext";
import { validateLicense } from "./validateLicense";

export interface HduxProProviderProps {
  /**
   * Your HDUX Pro license key. Format: `HDUX-PRO-XXXX-XXXX-XXXX-XXXX`.
   * Obtain one through the host application’s configured checkout.
   */
  licenseKey: string;
  /**
   * Override the validation endpoint (useful for self-hosted deployments).
   * Supply the endpoint derived from the host application’s SERVICE_URL.
   */
  validationUrl?: string;
  /** Browser GET checkout endpoint derived from the host’s SERVICE_URL. */
  checkoutUrl?: string;
  children: ReactNode;
}

/**
 * Wrap your app (or a subtree) in HduxProProvider to unlock Pro components.
 * Pass your license key; validation is performed once on mount.
 */
export function HduxProProvider({
  licenseKey,
  validationUrl,
  checkoutUrl,
  children,
}: HduxProProviderProps) {
  const [status, setStatus] = useState<ProLicenseStatus>(
    licenseKey ? "validating" : "no-key"
  );

  useEffect(() => {
    if (!licenseKey) {
      setStatus("no-key");
      return;
    }

    setStatus("validating");
    validateLicense(licenseKey, validationUrl).then((result) => {
      setStatus(result.valid ? "valid" : "invalid");
    });
  }, [licenseKey, validationUrl]);

  return (
    <HduxProContext.Provider value={{ status, licenseKey, checkoutUrl }}>
      {children}
    </HduxProContext.Provider>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { HduxProContext, type ProLicenseStatus } from "./ProContext";
import { validateLicense } from "./validateLicense";

export interface HduxProProviderProps {
  /**
   * Your HDUX Pro license key. Format: `HDUX-PRO-XXXX-XXXX-XXXX-XXXX`.
   * Obtain one at https://hdux.dev/pro
   */
  licenseKey: string;
  /**
   * Override the validation endpoint (useful for self-hosted deployments).
   * Defaults to `https://api.hdux.dev/v1/license/validate`.
   */
  validationUrl?: string;
  children: ReactNode;
}

/**
 * Wrap your app (or a subtree) in HduxProProvider to unlock Pro components.
 * Pass your license key; validation is performed once on mount.
 */
export function HduxProProvider({
  licenseKey,
  validationUrl,
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
    <HduxProContext.Provider value={{ status, licenseKey }}>
      {children}
    </HduxProContext.Provider>
  );
}

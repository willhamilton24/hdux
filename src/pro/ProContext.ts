import { createContext, useContext } from "react";

export type ProLicenseStatus = "validating" | "valid" | "invalid" | "no-key";

export interface HduxProContextValue {
  status: ProLicenseStatus;
  licenseKey: string | undefined;
  checkoutUrl?: string;
}

export const HduxProContext = createContext<HduxProContextValue>({
  status: "no-key",
  licenseKey: undefined,
});

export function useProLicense(): HduxProContextValue {
  return useContext(HduxProContext);
}

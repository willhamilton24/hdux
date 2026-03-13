import type { HduxMasterTheme } from "./types";

export const defaultLightTheme: HduxMasterTheme = {
  mainColor: "#1a1a2e",
  textColor: "#1a1a2e",
  background: "#f5f5f5",
  customColors: {
    success: "#2e7d32",
    failure: "#c62828",
    caution: "#f9a825",
    loading: "#1565c0",
  },
  typography: {
    mainFont: '"Quantico", system-ui, -apple-system, sans-serif',
    variants: {},
  },
  borderWidth: "2px",
  boxCorners: {
    length: "12px",
  },
};

export const defaultDarkTheme: HduxMasterTheme = {
  mainColor: "#00d4ff",
  textColor: "#e0e0e0",
  background: "#0a0a1a",
  customColors: {
    success: "#66bb6a",
    failure: "#ef5350",
    caution: "#ffca28",
    loading: "#42a5f5",
  },
  typography: {
    mainFont: '"Quantico", system-ui, -apple-system, sans-serif',
    variants: {},
  },
  borderWidth: "2px",
  boxCorners: {
    length: "12px",
  },
};

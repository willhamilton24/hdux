import { useContext } from "react";
import type { HduxThemeContext } from "./types";
import { ThemeContext } from "./ThemeProvider";

export function useTheme(): HduxThemeContext {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within an <HduxThemeProvider>");
  }
  return context;
}

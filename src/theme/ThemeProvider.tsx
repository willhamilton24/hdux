import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  HduxMasterTheme,
  HduxModeTheme,
  HduxResolvedTheme,
  HduxThemeConfig,
  HduxThemeContext,
  HduxThemeMode,
} from "./types";
import { defaultDarkTheme, defaultLightTheme } from "./defaults";
import {
  buildTransitionValue,
  registerColorProperties,
  themeToCustomProperties,
} from "./cssProperties";

export const ThemeContext = createContext<HduxThemeContext | null>(null);

function getBuiltinDefault(mode: HduxThemeMode): HduxMasterTheme {
  return mode === "dark" ? defaultDarkTheme : defaultLightTheme;
}

/** Resolve a full theme by layering: builtin defaults -> master -> mode override */
function resolveTheme(
  config: HduxThemeConfig,
  mode: HduxThemeMode
): HduxResolvedTheme {
  const builtin = getBuiltinDefault(mode);
  const master = config.master;

  // Start with builtin, overlay master structural + color values
  const base: HduxMasterTheme = master
    ? {
        ...builtin,
        ...master,
        customColors: { ...builtin.customColors, ...master.customColors },
        typography: {
          ...builtin.typography,
          ...master.typography,
          variants: {
            ...builtin.typography.variants,
            ...master.typography?.variants,
          },
        },
        boxCorners: { ...builtin.boxCorners, ...master.boxCorners },
      }
    : builtin;

  // Overlay mode-specific color values
  const modeTheme: HduxModeTheme | undefined = config[mode];
  const colors = modeTheme
    ? {
        mainColor: modeTheme.mainColor,
        textColor: modeTheme.textColor,
        background: modeTheme.background,
        customColors: { ...base.customColors, ...modeTheme.customColors },
      }
    : {
        mainColor: base.mainColor,
        textColor: base.textColor,
        background: base.background,
        customColors: { ...base.customColors },
      };

  return {
    mainColor: colors.mainColor,
    textColor: colors.textColor ?? colors.mainColor,
    background: colors.background,
    customColors: {
      success: colors.customColors.success ?? colors.mainColor,
      failure: colors.customColors.failure ?? colors.mainColor,
      caution: colors.customColors.caution ?? colors.mainColor,
      loading: colors.customColors.loading ?? colors.mainColor,
    },
    typography: {
      mainFont: base.typography.mainFont,
      variants: base.typography.variants ?? {},
    },
    borderWidth: base.borderWidth,
    boxCorners: {
      length: base.boxCorners.length,
      width: base.boxCorners.width ?? base.borderWidth,
    },
  };
}

function getAvailableModes(config: HduxThemeConfig): HduxThemeMode[] {
  const modes: HduxThemeMode[] = [];
  // If only master is provided (no mode-specific themes), just return light
  if (!config.light && !config.dark && !config.custom) {
    if (config.master) return ["light"];
    return ["light", "dark"];
  }
  if (config.light || (!config.dark && !config.custom)) modes.push("light");
  if (config.dark) modes.push("dark");
  if (config.custom) modes.push("custom");
  return modes;
}

export interface HduxThemeProviderProps {
  config?: HduxThemeConfig;
  children: ReactNode;
}

export function HduxThemeProvider({
  config = {},
  children,
}: HduxThemeProviderProps) {
  const [mode, setMode] = useState<HduxThemeMode>(
    config.defaultMode ?? "light"
  );

  const availableModes = useMemo(() => getAvailableModes(config), [config]);

  const theme = useMemo(() => resolveTheme(config, mode), [config, mode]);

  const style = useMemo(() => {
    const duration = config.transitionDuration ?? "200ms";
    const props = themeToCustomProperties(theme);
    return {
      ...props,
      transition: buildTransitionValue(duration),
      background: `var(--hdux-background)`,
      color: `var(--hdux-text-color)`,
      fontFamily: `var(--hdux-font-main)`,
      minHeight: "100%",
    } as React.CSSProperties;
  }, [theme, config.transitionDuration]);

  const contextValue = useMemo<HduxThemeContext>(
    () => ({ theme, mode, setMode, availableModes }),
    [theme, mode, availableModes]
  );

  // Register CSS color properties on mount for smooth transitions
  useEffect(() => {
    registerColorProperties();
  }, []);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="hdux-theme-root" data-hdux-theme={mode} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

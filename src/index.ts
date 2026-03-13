// Hamilton Dynamic User Experience (HDUX)
// React Component Framework

// Theme
export {
  HduxThemeProvider,
  useTheme,
  defaultLightTheme,
  defaultDarkTheme,
} from "./theme";
export type {
  HduxThemeProviderProps,
  HduxModeTheme,
  HduxMasterTheme,
  HduxResolvedTheme,
  HduxThemeMode,
  HduxThemeConfig,
  HduxThemeContext,
  HduxCustomColors,
  HduxTypography,
  HduxTypographyVariants,
  HduxBoxCorners,
} from "./theme";

// Components
export { Box } from "./components/Box";
export type {
  BoxProps,
  BoxAnimationMode,
  AnimationPhase,
  CornerBoxLoadingAnimationConfig,
  PulseConfig,
  BlinkConfig,
} from "./components/Box";

export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";

export { Text } from "./components/Text";
export type {
  TextProps,
  TextAnimation,
  TextVariant,
} from "./components/Text";

export {
  TopBar,
  BottomBar,
  BarLeft,
  BarCenter,
  BarRight,
  BarElement,
  ThemeSelector,
} from "./components/Bar";
export type {
  TopBarProps,
  BottomBarProps,
  BarSectionProps,
  BarElementProps,
  ThemeSelectorProps,
} from "./components/Bar";

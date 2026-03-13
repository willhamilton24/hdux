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

export { Text } from "./components/Text";
export type {
  TextProps,
  TextAnimation,
  TextVariant,
} from "./components/Text";

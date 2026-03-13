export interface HduxCustomColors {
  success?: string;
  failure?: string;
  caution?: string;
  loading?: string;
}

/** Color-only mode theme (light / dark / custom) */
export interface HduxModeTheme {
  mainColor: string;
  /** Defaults to mainColor when unset */
  textColor?: string;
  /** CSS color or url(...) for images */
  background: string;
  customColors?: HduxCustomColors;
}

export interface HduxTypographyVariants {
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  h6?: string;
  subheading?: string;
  body?: string;
  caption?: string;
  code?: string;
}

export interface HduxTypography {
  mainFont: string;
  variants?: HduxTypographyVariants;
}

export interface HduxBoxCorners {
  /** Corner decoration length, equal in each direction */
  length: string;
  /** Overrides borderWidth for corners */
  width?: string;
}

/** Master theme: mode colors + structural tokens */
export interface HduxMasterTheme extends HduxModeTheme {
  typography: HduxTypography;
  borderWidth: string;
  boxCorners: HduxBoxCorners;
}

/** Fully resolved theme with no optional fields */
export interface HduxResolvedTheme {
  mainColor: string;
  textColor: string;
  background: string;
  customColors: Required<HduxCustomColors>;
  typography: {
    mainFont: string;
    variants: HduxTypographyVariants;
  };
  borderWidth: string;
  boxCorners: {
    length: string;
    width: string;
  };
}

export type HduxThemeMode = "light" | "dark" | "custom";

export interface HduxThemeConfig {
  master?: HduxMasterTheme;
  light?: HduxModeTheme;
  dark?: HduxModeTheme;
  custom?: HduxModeTheme;
  defaultMode?: HduxThemeMode;
  /** Transition duration for smooth theme switching, e.g. "300ms" */
  transitionDuration?: string;
}

export interface HduxThemeContext {
  theme: HduxResolvedTheme;
  mode: HduxThemeMode;
  setMode: (mode: HduxThemeMode) => void;
  availableModes: HduxThemeMode[];
}

import type { HduxResolvedTheme, HduxTypographyVariants } from "./types";

const VARIANT_KEYS: (keyof HduxTypographyVariants)[] = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "body",
  "caption",
  "code",
];

/** Color properties that should animate during theme transitions */
const COLOR_PROPERTIES = [
  "--hdux-main-color",
  "--hdux-text-color",
  "--hdux-background",
  "--hdux-color-success",
  "--hdux-color-failure",
  "--hdux-color-caution",
  "--hdux-color-loading",
];

/** Convert a resolved theme to CSS custom property key-value pairs */
export function themeToCustomProperties(
  theme: HduxResolvedTheme
): Record<string, string> {
  const props: Record<string, string> = {
    "--hdux-main-color": theme.mainColor,
    "--hdux-text-color": theme.textColor,
    "--hdux-background": theme.background,
    "--hdux-color-success": theme.customColors.success,
    "--hdux-color-failure": theme.customColors.failure,
    "--hdux-color-caution": theme.customColors.caution,
    "--hdux-color-loading": theme.customColors.loading,
    "--hdux-font-main": theme.typography.mainFont,
    "--hdux-border-width": theme.borderWidth,
    "--hdux-box-corner-length": theme.boxCorners.length,
    "--hdux-box-corner-width": theme.boxCorners.width,
  };

  for (const key of VARIANT_KEYS) {
    const value = theme.typography.variants[key];
    if (value) {
      props[`--hdux-font-${key}`] = value;
    }
  }

  return props;
}

/** Build a CSS transition string for smooth color property animation */
export function buildTransitionValue(duration: string): string {
  return COLOR_PROPERTIES.map((prop) => `${prop} ${duration} ease-in-out`).join(
    ", "
  );
}

/** Register CSS custom properties as <color> type so they can be transitioned */
export function registerColorProperties(): void {
  if (typeof CSS === "undefined" || !("registerProperty" in CSS)) return;

  for (const name of COLOR_PROPERTIES) {
    try {
      CSS.registerProperty({
        name,
        syntax: "<color>",
        inherits: true,
        initialValue: "transparent",
      });
    } catch {
      // Already registered or unsupported — safe to ignore
    }
  }
}

import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";
import type { HduxThemeConfig, HduxResolvedTheme } from "./types";

const meta: Meta<typeof HduxThemeProvider> = {
  title: "HDUX/Theme",
  component: HduxThemeProvider,
};
export default meta;

type Story = StoryObj<typeof HduxThemeProvider>;

/* ── Shared demo components ─────────────────────────── */

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          background: color,
          border: "1px solid rgba(128,128,128,0.3)",
        }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{color}</div>
      </div>
    </div>
  );
}

function ThemeDemoPanel() {
  const { theme, mode, setMode, availableModes } = useTheme();

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Current Mode: {mode}</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {availableModes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 16px",
              border: `var(--hdux-border-width) solid var(--hdux-main-color)`,
              background: mode === m ? "var(--hdux-main-color)" : "transparent",
              color: mode === m ? "var(--hdux-background)" : "var(--hdux-text-color)",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "var(--hdux-font-main)",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <h3>Colors</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <ColorSwatch color={theme.mainColor} label="mainColor" />
        <ColorSwatch color={theme.textColor} label="textColor" />
        <ColorSwatch color={theme.background} label="background" />
        <ColorSwatch color={theme.customColors.success} label="success" />
        <ColorSwatch color={theme.customColors.failure} label="failure" />
        <ColorSwatch color={theme.customColors.caution} label="caution" />
        <ColorSwatch color={theme.customColors.loading} label="loading" />
      </div>

      <h3>Typography</h3>
      <div style={{ fontSize: 14 }}>
        <div>
          <strong>Main Font:</strong> {theme.typography.mainFont}
        </div>
      </div>

      <h3>Structure</h3>
      <div style={{ fontSize: 14, display: "flex", gap: 32 }}>
        <div>
          <strong>Border Width:</strong> {theme.borderWidth}
        </div>
        <div>
          <strong>Corner Length:</strong> {theme.boxCorners.length}
        </div>
        <div>
          <strong>Corner Width:</strong> {theme.boxCorners.width}
        </div>
      </div>

      <h3>Sample Card</h3>
      <SampleCard theme={theme} />
    </div>
  );
}

function SampleCard({ theme }: { theme: HduxResolvedTheme }) {
  return (
    <div
      style={{
        border: `var(--hdux-border-width) solid var(--hdux-main-color)`,
        padding: 20,
        maxWidth: 400,
        position: "relative",
      }}
    >
      {/* Box corner decorations */}
      {(["topLeft", "topRight", "bottomLeft", "bottomRight"] as const).map(
        (corner) => {
          const isTop = corner.includes("top");
          const isLeft = corner.includes("Left");
          return (
            <div
              key={corner}
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: -1,
                [isLeft ? "left" : "right"]: -1,
                width: `var(--hdux-box-corner-length)`,
                height: `var(--hdux-box-corner-length)`,
                [`border${isTop ? "Top" : "Bottom"}`]: `var(--hdux-box-corner-width) solid var(--hdux-main-color)`,
                [`border${isLeft ? "Left" : "Right"}`]: `var(--hdux-box-corner-width) solid var(--hdux-main-color)`,
              }}
            />
          );
        }
      )}
      <h4 style={{ margin: "0 0 8px" }}>HDUX Card</h4>
      <p style={{ margin: 0, opacity: 0.8 }}>
        This card uses theme tokens for its border, corner decorations, colors,
        and typography. Switch modes to see the smooth transition.
      </p>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        {(["success", "failure", "caution", "loading"] as const).map((key) => (
          <span
            key={key}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              border: `1px solid ${theme.customColors[key]}`,
              color: theme.customColors[key],
            }}
          >
            {key}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Stories ─────────────────────────────────────────── */

export const DefaultTheme: Story = {
  name: "Default (Light)",
  render: () => (
    <HduxThemeProvider>
      <ThemeDemoPanel />
    </HduxThemeProvider>
  ),
};

export const LightDarkToggle: Story = {
  name: "Light / Dark Toggle",
  render: () => (
    <HduxThemeProvider config={{ transitionDuration: "400ms" }}>
      <ThemeDemoPanel />
    </HduxThemeProvider>
  ),
};

const customConfig: HduxThemeConfig = {
  master: {
    mainColor: "#9c27b0",
    background: "#faf0ff",
    typography: {
      mainFont: '"Georgia", serif',
      variants: { h1: '"Palatino", serif' },
    },
    borderWidth: "3px",
    boxCorners: { length: "20px", width: "4px" },
  },
};

export const CustomMasterTheme: Story = {
  name: "Custom Master Theme",
  render: () => (
    <HduxThemeProvider config={customConfig}>
      <ThemeDemoPanel />
    </HduxThemeProvider>
  ),
};

const threeModeConfig: HduxThemeConfig = {
  master: {
    mainColor: "#333",
    background: "#fff",
    typography: {
      mainFont: '"Inter", system-ui, sans-serif',
    },
    borderWidth: "2px",
    boxCorners: { length: "16px" },
  },
  light: {
    mainColor: "#1a1a2e",
    background: "#f0f0f0",
    customColors: { success: "#388e3c", failure: "#d32f2f" },
  },
  dark: {
    mainColor: "#00e5ff",
    textColor: "#e0e0e0",
    background: "#121212",
    customColors: { success: "#81c784", failure: "#e57373" },
  },
  custom: {
    mainColor: "#ff6f00",
    textColor: "#fff8e1",
    background: "#1b0000",
    customColors: {
      success: "#ffab00",
      failure: "#ff1744",
      caution: "#ff9100",
      loading: "#ffea00",
    },
  },
  transitionDuration: "500ms",
};

export const ThreeModeSwitching: Story = {
  name: "Three-Mode Switching",
  render: () => (
    <HduxThemeProvider config={threeModeConfig}>
      <ThemeDemoPanel />
    </HduxThemeProvider>
  ),
};

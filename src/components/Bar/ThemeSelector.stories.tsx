import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Text } from "../Text/Text";
import { Box } from "../Box/Box";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { BarLeft, BarCenter, BarRight } from "./BarSections";
import { BarElement } from "./BarElement";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "../../theme/useTheme";
import type { HduxThemeConfig } from "../../theme/types";

const threeModeConfig: HduxThemeConfig = {
  master: {
    mainColor: "#00d4ff",
    textColor: "#e0e0e0",
    background: "#0a0a1a",
    typography: { mainFont: '"Inter", system-ui, sans-serif' },
    borderWidth: "2px",
    boxCorners: { length: "12px" },
  },
  light: {
    mainColor: "#1a1a2e",
    textColor: "#1a1a2e",
    background: "#f0f0f0",
  },
  dark: {
    mainColor: "#00d4ff",
    textColor: "#e0e0e0",
    background: "#0a0a1a",
  },
  custom: {
    mainColor: "#ff6f00",
    textColor: "#fff8e1",
    background: "#1b0000",
  },
  transitionDuration: "400ms",
};

const meta: Meta = {
  title: "HDUX/Components/ThemeSelector",
  decorators: [
    (Story) => (
      <HduxThemeProvider config={threeModeConfig}>
        <Story />
      </HduxThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

/* ── Standalone ─────────────────────────────────────── */

function StandaloneDemo() {
  const { mode } = useTheme();
  return (
    <div style={{ padding: 40 }}>
      <Text variant="h4" style={{ marginBottom: 16 }}>
        ThemeSelector
      </Text>
      <Text variant="body" style={{ marginBottom: 24 }}>
        Current mode: {mode.toUpperCase()}. Click the selector to cycle.
      </Text>
      <ThemeSelector size={48} />
    </div>
  );
}

export const Standalone: Story = {
  name: "Standalone",
  render: () => <StandaloneDemo />,
};

/* ── In TopBar (right corner) ───────────────────────── */

function TopBarDemo() {
  const { mode } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar static>
        <BarLeft>
          <BarElement>
            <Text variant="body">HDUX</Text>
          </BarElement>
        </BarLeft>
        <BarCenter>
          <BarElement borderless>
            <Text variant="body">CONTROL PANEL</Text>
          </BarElement>
        </BarCenter>
        <BarRight>
          <BarElement>
            <Text variant="body">{mode.toUpperCase()}</Text>
          </BarElement>
          <BarElement borderless style={{ padding: "4px 8px" }}>
            <ThemeSelector size={36} />
          </BarElement>
        </BarRight>
      </TopBar>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <Box animation="static" fullBorder style={{ width: 400 }}>
          <div style={{ padding: 20 }}>
            <Text variant="h4">Theme Preview</Text>
            <Text variant="body" style={{ marginTop: 8 }}>
              Use the selector in the top-right corner to switch themes. The
              entire UI transitions smoothly between modes.
            </Text>
          </div>
        </Box>
      </div>
    </div>
  );
}

export const InTopBar: Story = {
  name: "In TopBar (Right Corner)",
  render: () => <TopBarDemo />,
};

/* ── In BottomBar (left corner) ─────────────────────── */

function BottomBarDemo() {
  const { mode } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <Box animation="static" fullBorder style={{ width: 400 }}>
          <div style={{ padding: 20 }}>
            <Text variant="h4">Theme Preview</Text>
            <Text variant="body" style={{ marginTop: 8 }}>
              The ThemeSelector sits in the bottom-left corner of the BottomBar.
            </Text>
          </div>
        </Box>
      </div>

      <BottomBar static>
        <BarLeft>
          <BarElement borderless style={{ padding: "4px 8px" }}>
            <ThemeSelector size={36} />
          </BarElement>
          <BarElement>
            <Text variant="body">{mode.toUpperCase()}</Text>
          </BarElement>
        </BarLeft>
        <BarRight>
          <BarElement>
            <Text variant="body">v0.1.0</Text>
          </BarElement>
        </BarRight>
      </BottomBar>
    </div>
  );
}

export const InBottomBar: Story = {
  name: "In BottomBar (Left Corner)",
  render: () => <BottomBarDemo />,
};

/* ── Full layout with both bars ─────────────────────── */

function FullLayoutDemo() {
  const { mode } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar static>
        <BarLeft>
          <BarElement>
            <Text variant="body">HDUX</Text>
          </BarElement>
          <BarElement>
            <Text variant="body">MODULES</Text>
          </BarElement>
        </BarLeft>
        <BarCenter>
          <BarElement borderless>
            <Text variant="body">HAMILTON DYNAMIC USER EXPERIENCE</Text>
          </BarElement>
        </BarCenter>
        <BarRight>
          <BarElement borderless style={{ padding: "4px 8px" }}>
            <ThemeSelector size={36} />
          </BarElement>
        </BarRight>
      </TopBar>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <Box animation="static" fullBorder style={{ maxWidth: 500 }}>
          <div style={{ padding: 20 }}>
            <Text variant="h3">System Status</Text>
            <Text variant="subheading" style={{ marginTop: 4 }}>
              MODE: {mode.toUpperCase()}
            </Text>
            <Text variant="body" style={{ marginTop: 12 }}>
              All systems are operating within normal parameters. Theme
              transitions are smooth across all components.
            </Text>
          </div>
        </Box>
      </div>

      <BottomBar static>
        <BarLeft>
          <BarElement>
            <Text variant="body">v0.1.0</Text>
          </BarElement>
        </BarLeft>
        <BarCenter>
          <BarElement borderless>
            <Text variant="body">READY</Text>
          </BarElement>
        </BarCenter>
        <BarRight>
          <BarElement>
            <Text variant="body">14:32:07</Text>
          </BarElement>
        </BarRight>
      </BottomBar>
    </div>
  );
}

export const FullLayout: Story = {
  name: "Full Layout",
  render: () => <FullLayoutDemo />,
};

/* ── Custom size ────────────────────────────────────── */

function SizesDemo() {
  return (
    <div style={{ padding: 40, display: "flex", gap: 24, alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <ThemeSelector size={24} />
        <Text variant="body" style={{ marginTop: 8, fontSize: 12 }}>24px</Text>
      </div>
      <div style={{ textAlign: "center" }}>
        <ThemeSelector size={32} />
        <Text variant="body" style={{ marginTop: 8, fontSize: 12 }}>32px</Text>
      </div>
      <div style={{ textAlign: "center" }}>
        <ThemeSelector size={48} />
        <Text variant="body" style={{ marginTop: 8, fontSize: 12 }}>48px</Text>
      </div>
      <div style={{ textAlign: "center" }}>
        <ThemeSelector size={64} />
        <Text variant="body" style={{ marginTop: 8, fontSize: 12 }}>64px</Text>
      </div>
    </div>
  );
}

export const Sizes: Story = {
  name: "Sizes",
  render: () => <SizesDemo />,
};

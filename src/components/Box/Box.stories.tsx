import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Box } from "./Box";
import { Text } from "../Text/Text";
import type { BoxProps } from "./types";

const meta: Meta<typeof Box> = {
  title: "HDUX/Components/Box",
  component: Box,
  decorators: [
    (Story) => (
      <HduxThemeProvider
        config={{
          defaultMode: "dark",
          master: {
            mainColor: "#00d4ff",
            textColor: "#e0e0e0",
            background: "#0a0a1a",
            typography: { mainFont: '"Quantico", system-ui, sans-serif' },
            borderWidth: "2px",
            boxCorners: { length: "12px" },
          },
        }}
      >
        <div style={{ padding: 40 }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
  argTypes: {
    animation: {
      control: "select",
      options: ["static", "standard", "verticalFirst", "horizontalFirst"],
    },
    hasLoaded: { control: "boolean" },
    loadingText: { control: "text" },
    hideLoadingText: { control: "boolean" },
    fullBorder: { control: "boolean" },
    color: { control: "color" },
    textColor: { control: "color" },
    cornerColor: { control: "color" },
    cornerLength: { control: { type: "number", min: 4, max: 60 } },
    cornerWidth: { control: { type: "number", min: 1, max: 10 } },
  },
};
export default meta;

type Story = StoryObj<typeof Box>;

const SampleContent = () => (
  <div style={{ padding: 20 }}>
    <Text variant="h4">System Online</Text>
    <Text variant="body" style={{ marginTop: 8 }}>
      All subsystems initialized and operational. Core modules loaded
      successfully. Ready for user interaction.
    </Text>
  </div>
);

const AnimatedSampleContent = () => (
  <div style={{ padding: 20 }}>
    <Text variant="h4" animation="print">
      SYSTEM ONLINE
    </Text>
    <Text variant="body" animation="sweep" style={{ marginTop: 8 }}>
      All subsystems initialized and operational. Core modules loaded
      successfully. Ready for user interaction.
    </Text>
  </div>
);

/* ── Static ─────────────────────────────────────────── */

export const Static: Story = {
  args: {
    animation: "static",
  },
  render: (args) => (
    <Box {...args} style={{ width: 400 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Standard Loading ───────────────────────────────── */

export const StandardLoading: Story = {
  name: "Standard Animation",
  args: {
    animation: "standard",
    hasLoaded: false,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Vertical First ─────────────────────────────────── */

export const VerticalFirst: Story = {
  name: "Vertical First Animation",
  args: {
    animation: "verticalFirst",
    hasLoaded: false,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Horizontal First ───────────────────────────────── */

export const HorizontalFirst: Story = {
  name: "Horizontal First Animation",
  args: {
    animation: "horizontalFirst",
    hasLoaded: false,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Hidden Loading Text ────────────────────────────── */

export const HiddenLoadingText: Story = {
  args: {
    animation: "standard",
    hasLoaded: false,
    hideLoadingText: true,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Custom Loading Text ────────────────────────────── */

export const CustomLoadingText: Story = {
  args: {
    animation: "standard",
    hasLoaded: false,
    loadingText: "INITIALIZING SYSTEM",
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── With Text Pulse ────────────────────────────────── */

export const WithTextPulse: Story = {
  args: {
    animation: "standard",
    hasLoaded: false,
    loadingAnimations: { textPulse: { duration: 800 } },
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── With Corner Spin ───────────────────────────────── */

export const WithCornerSpin: Story = {
  args: {
    animation: "standard",
    hasLoaded: false,
    loadingAnimations: { cornerSpin: { duration: 400 } },
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── With Corner Pulse ──────────────────────────────── */

export const WithCornerPulse: Story = {
  args: {
    animation: "standard",
    hasLoaded: false,
    loadingAnimations: { cornerPulse: { duration: 600 } },
  },
  render: (args) => (
    <Box {...args} style={{ width: 400, minHeight: 120 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Full Border ────────────────────────────────────── */

export const FullBorder: Story = {
  args: {
    animation: "static",
    fullBorder: true,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Custom Colors ──────────────────────────────────── */

export const CustomColors: Story = {
  args: {
    animation: "static",
    cornerColor: "#ff6f00",
    textColor: "#ffca28",
    fullBorder: true,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Custom Corner Size ─────────────────────────────── */

export const CustomCornerSize: Story = {
  args: {
    animation: "static",
    cornerLength: 24,
    cornerWidth: 4,
  },
  render: (args) => (
    <Box {...args} style={{ width: 400 }}>
      <SampleContent />
    </Box>
  ),
};

/* ── Auto-Play Demo ─────────────────────────────────── */

function AutoPlayBox(props: Partial<BoxProps>) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, []);

  return (
    <Box
      animation="standard"
      hasLoaded={loaded}
      loadingAnimations={{
        textPulse: { duration: 800 },
        cornerBlinkStart: { iterations: 2 },
        contentBlink: { iterations: 1 },
      }}
      fullBorder
      style={{ width: 400, minHeight: 120 }}
      {...props}
    >
      <AnimatedSampleContent />
    </Box>
  );
}

export const AutoPlay: Story = {
  name: "Auto-Play Demo",
  render: () => <AutoPlayBox />,
};

/* ── All Animation Types Side-by-Side ───────────────── */

function AllTypesDemo() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, []);

  const modes = ["standard", "verticalFirst", "horizontalFirst"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {modes.map((mode) => (
        <div key={mode}>
          <div
            style={{
              fontSize: 12,
              opacity: 0.6,
              marginBottom: 8,
              letterSpacing: "0.1em",
            }}
          >
            {mode.toUpperCase()}
          </div>
          <Box
            animation={mode}
            hasLoaded={loaded}
            loadingAnimations={{
              textPulse: { duration: 800 },
              cornerBlinkStart: { iterations: 1 },
            }}
            fullBorder
            style={{ width: 400, minHeight: 100 }}
          >
            <AnimatedSampleContent />
          </Box>
        </div>
      ))}
    </div>
  );
}

export const AllAnimationTypes: Story = {
  name: "All Animation Types",
  render: () => <AllTypesDemo />,
};

/* ── With All Blink Animations ──────────────────────── */

function FullBlinkDemo() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <Box
      animation="standard"
      hasLoaded={loaded}
      loadingAnimations={{
        cornerSpin: { duration: 400 },
        textBlink: { iterations: 2 },
        cornerBlinkStart: { iterations: 2 },
        cornerBlinkEnd: { iterations: 1 },
        contentBlink: { iterations: 2 },
      }}
      fullBorder
      style={{ width: 400, minHeight: 120 }}
    >
      <AnimatedSampleContent />
    </Box>
  );
}

export const WithAllBlinkAnimations: Story = {
  name: "Full Blink Sequence",
  render: () => <FullBlinkDemo />,
};

import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Box } from "../Box/Box";
import { Text } from "./Text";
import type { TextVariant } from "./types";

const meta: Meta<typeof Text> = {
  title: "HDUX/Components/Text",
  component: Text,
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
      options: ["none", "print", "sweep"],
    },
    variant: {
      control: "select",
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "subheading",
        "body",
      ],
    },
    color: { control: "color" },
    fontSize: { control: "text" },
    fontFamily: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

/* ── Static variants ────────────────────────────────── */

export const AllVariants: Story = {
  name: "All Variants",
  render: () => {
    const variants: TextVariant[] = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "subheading",
      "body",
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {variants.map((v) => (
          <Text key={v} variant={v}>
            {v.toUpperCase()} — The quick brown fox jumps over the lazy dog
          </Text>
        ))}
      </div>
    );
  },
};

/* ── Print animation ────────────────────────────────── */

export const PrintAnimation: Story = {
  name: "Print Animation",
  render: () => (
    <Text animation="print" variant="body">
      System initialized. All modules loaded successfully. Welcome to HDUX.
    </Text>
  ),
};

/* ── Sweep animation ────────────────────────────────── */

export const SweepAnimation: Story = {
  name: "Sweep Animation",
  render: () => (
    <Text animation="sweep" variant="h3">
      HAMILTON DYNAMIC USER EXPERIENCE
    </Text>
  ),
};

/* ── Custom color ───────────────────────────────────── */

export const CustomColor: Story = {
  args: {
    color: "#ff6f00",
    variant: "h2",
  },
  render: (args) => <Text {...args}>Custom Colored Heading</Text>,
};

/* ── Custom font size ───────────────────────────────── */

export const CustomFontSize: Story = {
  args: {
    fontSize: "36px",
    variant: "body",
  },
  render: (args) => <Text {...args}>Oversized body text at 36px</Text>,
};

/* ── Inside a static Box ────────────────────────────── */

export const InsideStaticBox: Story = {
  name: "Inside Static Box",
  render: () => (
    <Box animation="static" fullBorder style={{ width: 500 }}>
      <div style={{ padding: 20 }}>
        <Text variant="h3">System Status</Text>
        <Text variant="subheading" color="#00d4ff" style={{ marginTop: 4 }}>
          ALL SYSTEMS NOMINAL
        </Text>
        <Text variant="body" style={{ marginTop: 12 }}>
          Core processes are running within expected parameters. No anomalies
          detected in the primary subsystems.
        </Text>
      </div>
    </Box>
  ),
};

/* ── Sequenced with Box animation ───────────────────── */

function SequencedDemo() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <Box
      animation="standard"
      hasLoaded={loaded}
      loadingAnimations={{ textPulse: { duration: 800 } }}
      fullBorder
      style={{ width: 500, minHeight: 120 }}
    >
      <div style={{ padding: 20 }}>
        <Text variant="h3" animation="print">
          SYSTEM ONLINE
        </Text>
        <Text variant="body" animation="sweep" style={{ marginTop: 12 }}>
          All subsystems initialized and operational. Core modules loaded
          successfully. Ready for user interaction.
        </Text>
      </div>
    </Box>
  );
}

export const SequencedWithBox: Story = {
  name: "Sequenced with Box Animation",
  render: () => <SequencedDemo />,
};

/* ── Print inside animated Box ──────────────────────── */

function PrintAfterBoxDemo() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, []);

  return (
    <Box
      animation="verticalFirst"
      hasLoaded={loaded}
      loadingAnimations={{
        cornerSpin: { duration: 400 },
        cornerBlinkStart: { iterations: 1 },
      }}
      fullBorder
      style={{ width: 500, minHeight: 120 }}
    >
      <div style={{ padding: 20 }}>
        <Text variant="h4" animation="print">
          DIAGNOSTIC REPORT
        </Text>
        <Text
          variant="subheading"
          animation="print"
          color="#00d4ff"
          style={{ marginTop: 8 }}
        >
          STATUS: ALL CLEAR
        </Text>
        <Text variant="body" animation="sweep" style={{ marginTop: 12 }}>
          Memory allocation nominal. Network latency within tolerance. CPU
          utilization at 23%. All scheduled tasks completed without errors.
        </Text>
      </div>
    </Box>
  );
}

export const PrintAfterBox: Story = {
  name: "Print After Box Animation",
  render: () => <PrintAfterBoxDemo />,
};

/* ── Multiple texts sweep in sequence ───────────────── */

export const MultipleSweep: Story = {
  name: "Multiple Sweep Texts",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text variant="h2" animation="sweep">
        HDUX FRAMEWORK
      </Text>
      <Text variant="subheading" animation="sweep" color="#00d4ff">
        HAMILTON DYNAMIC USER EXPERIENCE
      </Text>
      <Text variant="body" animation="sweep">
        A React component framework designed for building dynamic, animated user
        interfaces with a distinctive sci-fi aesthetic.
      </Text>
    </div>
  ),
};

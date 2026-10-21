import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { RadialMeter } from "./RadialMeter";

const meta: Meta<typeof RadialMeter> = {
  title: "HDUX/Components/RadialMeter",
  component: RadialMeter,
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
    value: { control: { type: "number", min: 0, max: 100 } },
    min: { control: { type: "number" } },
    max: { control: { type: "number", min: 1 } },
    size: { control: { type: "number", min: 60, max: 300 } },
    strokeWidth: { control: { type: "number", min: 2, max: 20 } },
    color: { control: "color" },
    showValue: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof RadialMeter>;

export const Default: Story = {
  args: {
    value: 72,
    label: "POWER",
  },
};

export const HUDPanel: Story = {
  name: "HUD Panel",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      <RadialMeter value={88} label="HULL" />
      <RadialMeter value={54} label="SHIELD" color="#7b2fff" />
      <RadialMeter value={31} label="FUEL" color="#ff6f00" />
      <RadialMeter value={97} label="CPU" color="#00e676" />
    </div>
  ),
};

export const Large: Story = {
  name: "Large",
  args: {
    value: 64,
    label: "CORE TEMP",
    size: 200,
    strokeWidth: 10,
  },
};

export const Animated: Story = {
  name: "Animated (Live Update)",
  render: () => {
    const [val, setVal] = useState(10);
    useEffect(() => {
      const id = setInterval(() => {
        setVal((v) => (v >= 100 ? 5 : v + 7));
      }, 900);
      return () => clearInterval(id);
    }, []);
    return <RadialMeter value={val} label="SIGNAL" />;
  },
};

export const CustomFormat: Story = {
  name: "Custom Format",
  args: {
    value: 72,
    max: 100,
    label: "EFFICIENCY",
    formatValue: (v) => `${v}%`,
  },
};

export const Empty: Story = {
  name: "Zero Value",
  args: {
    value: 0,
    label: "OFFLINE",
    color: "#ff1744",
  },
};

import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { StatBar } from "./StatBar";

const meta: Meta<typeof StatBar> = {
  title: "HDUX/Components/StatBar",
  component: StatBar,
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
        <div style={{ padding: 40, maxWidth: 400 }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
  argTypes: {
    value: { control: { type: "number", min: 0, max: 100 } },
    max: { control: { type: "number", min: 1 } },
    height: { control: { type: "number", min: 2, max: 32 } },
    color: { control: "color" },
    animated: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof StatBar>;

export const Default: Story = {
  args: {
    value: 72,
    label: "Hull Integrity",
    showValue: "percent",
  },
};

export const SystemPanel: Story = {
  name: "System Panel",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StatBar label="Hull Integrity" value={88} showValue="percent" />
      <StatBar label="Shield Power" value={54} color="#7b2fff" showValue="percent" />
      <StatBar label="Fuel Reserve" value={31} color="#ff6f00" showValue="percent" />
      <StatBar label="Ammo" value={12} max={50} color="#ff1744" showValue />
    </div>
  ),
};

export const Thick: Story = {
  name: "Thick Bar",
  args: {
    value: 60,
    label: "Power Output",
    height: 20,
    showValue: "percent",
  },
};

export const Animated: Story = {
  name: "Animated (Live Update)",
  render: () => {
    const [val, setVal] = useState(10);
    useEffect(() => {
      const id = setInterval(() => {
        setVal((v) => (v >= 100 ? 10 : v + 10));
      }, 1200);
      return () => clearInterval(id);
    }, []);
    return <StatBar label="Download Progress" value={val} showValue="percent" animated />;
  },
};

export const NoLabel: Story = {
  name: "No Label",
  args: { value: 45 },
};

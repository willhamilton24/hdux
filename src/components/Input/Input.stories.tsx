import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "HDUX/Components/Input",
  component: Input,
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
        <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
  argTypes: {
    color: { control: "color" },
    cornerLength: { control: { type: "number", min: 4, max: 60 } },
    cornerWidth: { control: { type: "number", min: 1, max: 8 } },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "ENTER CALLSIGN",
  },
};

export const WithLabel: Story = {
  name: "With Label",
  args: {
    label: "Operator ID",
    placeholder: "ENTER ID",
  },
};

export const Controlled: Story = {
  name: "Controlled",
  render: () => {
    const [val, setVal] = useState("");
    return (
      <Input
        label="Target Coordinates"
        placeholder="00.000 N, 00.000 W"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
    );
  },
};

export const InputRow: Story = {
  name: "Input Row",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Input label="Username" placeholder="OPERATOR" />
      <Input label="Password" type="password" placeholder="••••••••" />
    </div>
  ),
};

export const CustomColors: Story = {
  name: "Custom Colors",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Input label="Alert Level" placeholder="CRITICAL" color="#ff1744" />
      <Input label="Status" placeholder="NOMINAL" color="#00e676" />
      <Input label="Warning" placeholder="ELEVATED" color="#ff6f00" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "System ID",
    value: "SYS-4472-ALPHA",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  name: "Read Only",
  args: {
    label: "Access Token",
    value: "hdx_live_k9m2p7…",
    readOnly: true,
  },
};

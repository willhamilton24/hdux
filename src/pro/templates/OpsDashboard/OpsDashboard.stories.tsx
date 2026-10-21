import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxProProvider } from "../../ProProvider";
import { OpsDashboard } from "./OpsDashboard";

const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";

const meta: Meta<typeof OpsDashboard> = {
  title: "HDUX Pro/Templates/OpsDashboard",
  component: OpsDashboard,
  decorators: [
    (Story) => (
      <HduxProProvider licenseKey={PRO_KEY}>
        <Story />
      </HduxProProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof OpsDashboard>;

export const Default: Story = {};

export const CustomData: Story = {
  name: "Custom Data",
  args: {
    title: "FLEET MONITOR",
    systemName: "NEXUS CONTROL",
    metrics: [
      { label: "CPU", value: 45 },
      { label: "MEM", value: 61 },
      { label: "NET", value: 88 },
      { label: "STOR", value: 34 },
    ],
  },
};

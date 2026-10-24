import type { Meta, StoryObj } from "@storybook/react-vite";
import { licensed, unlicensed } from "../../../../.storybook/licenseFixtures";
import { OpsDashboard } from "./OpsDashboard";


const meta: Meta<typeof OpsDashboard> = {
  title: "HDUX Pro/Templates/OpsDashboard",
  component: OpsDashboard,
  decorators: [licensed],
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

import { expect, waitFor } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxProProvider } from "../../ProProvider";
import { OpsDashboard } from "./OpsDashboard";

import { PRO_KEY, VALIDATION_URL, mockProValidation } from "../../../../.storybook/proFixture";

const meta: Meta<typeof OpsDashboard> = {
  title: "HDUX Pro/Templates/OpsDashboard",
  component: OpsDashboard,
  beforeEach: mockProValidation,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".hdux-pro-gate")).toBeNull());
    await expect(canvasElement.querySelector(".hdux-ops-dashboard")).not.toBeNull();
  },
  decorators: [
    (Story) => (
      <HduxProProvider licenseKey={PRO_KEY} validationUrl={VALIDATION_URL}>
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

export const Default: Story = { args: { demoMode: true } };

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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxProProvider } from "../../ProProvider";
import { LandingPage } from "./LandingPage";

const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";

const meta: Meta<typeof LandingPage> = {
  title: "HDUX Pro/Templates/LandingPage",
  component: LandingPage,
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

type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {};

export const CustomBranding: Story = {
  name: "Custom Branding",
  args: {
    productName: "NEXUS",
    tagline: "THE CONTROL INTERFACE FOR MODERN OPS",
    subTagline: "Drop-in HUD components built for operational dashboards, game UIs, and mission-critical tools.",
  },
};

export const LightMode: Story = {
  name: "Without Pro License (Gated Preview)",
  decorators: [
    (Story) => (
      // No HduxProProvider: Pro components show their gate overlay
      <Story />
    ),
  ],
};

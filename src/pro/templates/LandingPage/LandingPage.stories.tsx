import type { Meta, StoryObj } from "@storybook/react-vite";
import { licensed, unlicensed } from "../../../../.storybook/licenseFixtures";
import { LandingPage } from "./LandingPage";


const meta: Meta<typeof LandingPage> = {
  title: "HDUX Pro/Templates/LandingPage",
  component: LandingPage,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof LandingPage>;

export const Default: Story = { decorators: [licensed] };

export const CustomBranding: Story = {
  name: "Custom Branding",
  decorators: [licensed],
  args: {
    productName: "NEXUS",
    tagline: "THE CONTROL INTERFACE FOR MODERN OPS",
    subTagline: "Drop-in HUD components built for operational dashboards, game UIs, and mission-critical tools.",
  },
};

export const LightMode: Story = {
  name: "Without Pro License (Gated Preview)",
  decorators: [unlicensed],
};

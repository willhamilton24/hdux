import { expect, waitFor, userEvent, within, fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxProProvider } from "../../ProProvider";
import { LandingPage } from "./LandingPage";

import { PRO_KEY, VALIDATION_URL, mockProValidation } from "../../../../.storybook/proFixture";

const meta: Meta<typeof LandingPage> = {
  title: "HDUX Pro/Templates/LandingPage",
  component: LandingPage,
  beforeEach: mockProValidation,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".hdux-pro-gate")).toBeNull());
    await expect(canvasElement.querySelector(".hdux-landing")).not.toBeNull();
    const buttons = (await within(canvasElement).findAllByRole("button")).filter(button =>
      button.classList.contains("hdux-btn"));
    await userEvent.click(buttons[0]);
    await expect(canvasElement.querySelector('[role="alert"]')).toBeNull();
  },
  args: { onCtaClick: fn(async () => {}) },
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

type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {};

export const CustomBrand: Story = {
  name: "Custom Brand",
  args: {
    headline: "NEXUS CONTROL",
    tagline: "Mission-critical dashboards and game interfaces, built on HDUX.",
    brandName: "NEXUS",
    ctaLabel: "LAUNCH DASHBOARD →",
    color: "#7b2fff",
    stats: [
      { label: "UPTIME", value: "99.9%" },
      { label: "AGENTS ONLINE", value: "2,841" },
      { label: "DATA STREAMS", value: "14" },
      { label: "ALERTS TODAY", value: "3" },
    ],
    features: [
      {
        label: "LIVE TELEMETRY",
        description: "Sub-second metric updates with animated charts that react to your data streams.",
        stat: "REAL-TIME",
      },
      {
        label: "TEAM COORDINATION",
        description: "Lobby interfaces with ready-state, countdown, and live team roster.",
        stat: "MULTIPLAYER READY",
      },
      {
        label: "HUD OVERLAYS",
        description: "Circular gauges, stat bars, and cluster views for heads-up display layouts.",
        stat: "HUD NATIVE",
      },
    ],
  },
};

export const GreenAccent: Story = {
  name: "Green Accent",
  args: {
    color: "#00e676",
    headline: "ARCLIGHT SYSTEMS",
    tagline: "Operational intelligence for critical infrastructure.",
    brandName: "ARCLIGHT",
    ctaLabel: "ACCESS CONSOLE →",
  },
};

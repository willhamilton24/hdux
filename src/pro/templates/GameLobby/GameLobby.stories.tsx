import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxProProvider } from "../../ProProvider";
import { GameLobby } from "./GameLobby";

const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";

const meta: Meta<typeof GameLobby> = {
  title: "HDUX Pro/Templates/GameLobby",
  component: GameLobby,
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

type Story = StoryObj<typeof GameLobby>;

export const Default: Story = {};

export const AllReady: Story = {
  name: "All Players Ready",
  args: {
    players: [
      { id: 1, name: "ACE_PILOT",  status: "ready", team: "A", stat: "2841 MMR", isLocalPlayer: true },
      { id: 2, name: "GHOST_0x7F", status: "ready", team: "A", stat: "2790 MMR" },
      { id: 3, name: "UNIT_NULL",  status: "ready", team: "A", stat: "2650 MMR" },
      { id: 4, name: "SHADOW_KIT", status: "ready", team: "B", stat: "2900 MMR" },
      { id: 5, name: "NEON_STRIKE",status: "ready", team: "B", stat: "2755 MMR" },
      { id: 6, name: "VOID_ECHO",  status: "ready", team: "B", stat: "2810 MMR" },
    ],
    matchInfo: { title: "MATCH LOBBY", mode: "RANKED — 3v3", map: "SECTOR DELTA-9", countdown: 30 },
  },
};

export const Countdown: Story = {
  name: "With Countdown",
  args: {
    matchInfo: {
      title: "MATCH STARTING",
      mode: "RANKED — 3v3",
      map: "VOID STATION",
      countdown: 15,
    },
  },
};

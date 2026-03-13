import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Text } from "../Text/Text";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { BarLeft, BarCenter, BarRight } from "./BarSections";
import { BarElement } from "./BarElement";
import { BarButton } from "./BarButton";

const meta: Meta = {
  title: "HDUX/Components/Bar",
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
        <Story />
      </HduxThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

/* ── TopBar basic ───────────────────────────────────── */

export const TopBarBasic: Story = {
  name: "TopBar — Basic",
  render: () => (
    <TopBar static>
      <BarLeft>
        <BarElement>
          <Text variant="body">HDUX</Text>
        </BarElement>
      </BarLeft>
      <BarRight>
        <BarElement>
          <Text variant="body">STATUS: ONLINE</Text>
        </BarElement>
      </BarRight>
    </TopBar>
  ),
};

/* ── TopBar with all three sections ─────────────────── */

export const TopBarThreeSections: Story = {
  name: "TopBar — Three Sections",
  render: () => (
    <TopBar static>
      <BarLeft>
        <BarElement>
          <Text variant="body">MENU</Text>
        </BarElement>
        <BarElement>
          <Text variant="body">FILES</Text>
        </BarElement>
      </BarLeft>
      <BarCenter>
        <BarElement borderless>
          <Text variant="body">HAMILTON DYNAMIC USER EXPERIENCE</Text>
        </BarElement>
      </BarCenter>
      <BarRight>
        <BarElement>
          <Text variant="body">SETTINGS</Text>
        </BarElement>
        <BarElement>
          <Text variant="body">USER</Text>
        </BarElement>
      </BarRight>
    </TopBar>
  ),
};

/* ── BottomBar basic ────────────────────────────────── */

export const BottomBarBasic: Story = {
  name: "BottomBar — Basic",
  render: () => (
    <BottomBar static>
      <BarLeft>
        <BarElement>
          <Text variant="body">v0.1.0</Text>
        </BarElement>
      </BarLeft>
      <BarRight>
        <BarElement>
          <Text variant="body">CPU: 23%</Text>
        </BarElement>
        <BarElement>
          <Text variant="body">MEM: 4.2GB</Text>
        </BarElement>
      </BarRight>
    </BottomBar>
  ),
};

/* ── BottomBar centered ─────────────────────────────── */

export const BottomBarCentered: Story = {
  name: "BottomBar — Center Only",
  render: () => (
    <BottomBar static>
      <BarCenter>
        <BarElement borderless>
          <Text variant="body" color="#00d4ff">
            ALL SYSTEMS NOMINAL
          </Text>
        </BarElement>
      </BarCenter>
    </BottomBar>
  ),
};

/* ── BarButton ─────────────────────────────────────── */

export const BarButtons: Story = {
  name: "BarButton",
  render: () => (
    <TopBar static>
      <BarLeft>
        <BarElement borderless>
          <Text variant="body">HDUX</Text>
        </BarElement>
      </BarLeft>
      <BarRight>
        <BarButton onClick={() => console.log("Deploy")}>
          <Text variant="body">DEPLOY</Text>
        </BarButton>
        <BarButton onClick={() => console.log("Sync")}>
          <Text variant="body">SYNC</Text>
        </BarButton>
        <BarButton onClick={() => console.log("Abort")} color="#ff1744" textColor="#ff1744">
          <Text variant="body" color="#ff1744">ABORT</Text>
        </BarButton>
      </BarRight>
    </TopBar>
  ),
};

/* ── Clickable BarElements ──────────────────────────── */

export const ClickableElements: Story = {
  name: "Clickable BarElements",
  render: () => (
    <TopBar static>
      <BarLeft>
        <BarElement onClick={() => alert("Dashboard clicked")}>
          <Text variant="body">DASHBOARD</Text>
        </BarElement>
        <BarElement onClick={() => alert("Reports clicked")}>
          <Text variant="body">REPORTS</Text>
        </BarElement>
        <BarElement onClick={() => alert("Analytics clicked")}>
          <Text variant="body">ANALYTICS</Text>
        </BarElement>
      </BarLeft>
    </TopBar>
  ),
};

/* ── Custom colors ──────────────────────────────────── */

export const CustomColors: Story = {
  name: "Custom Colors",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <TopBar static color="#ff6f00" background="#1a0a00">
        <BarLeft>
          <BarElement>
            <Text variant="body" color="#ff6f00">
              ALERT MODE
            </Text>
          </BarElement>
        </BarLeft>
        <BarRight>
          <BarElement>
            <Text variant="body" color="#ffca28">
              WARNING
            </Text>
          </BarElement>
        </BarRight>
      </TopBar>

      <BottomBar static color="#66bb6a" background="#0a1a0a">
        <BarCenter>
          <BarElement borderless>
            <Text variant="body" color="#66bb6a">
              SECURE CONNECTION ESTABLISHED
            </Text>
          </BarElement>
        </BarCenter>
      </BottomBar>
    </div>
  ),
};

/* ── Full layout demo ───────────────────────────────── */

export const FullLayout: Story = {
  name: "Full Layout (TopBar + BottomBar)",
  render: () => (
    <div
      style={{
        position: "relative",
        height: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar static>
        <BarLeft>
          <BarElement>
            <Text variant="body">HDUX</Text>
          </BarElement>
          <BarElement>
            <Text variant="body">MODULES</Text>
          </BarElement>
        </BarLeft>
        <BarCenter>
          <BarElement borderless>
            <Text variant="body">CONTROL PANEL</Text>
          </BarElement>
        </BarCenter>
        <BarRight>
          <BarElement>
            <Text variant="body">ADMIN</Text>
          </BarElement>
        </BarRight>
      </TopBar>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
          fontSize: 14,
        }}
      >
        <Text variant="body">— Main Content Area —</Text>
      </div>

      <BottomBar static>
        <BarLeft>
          <BarElement>
            <Text variant="body">v0.1.0</Text>
          </BarElement>
        </BarLeft>
        <BarCenter>
          <BarElement borderless>
            <Text variant="body" color="#00d4ff">
              READY
            </Text>
          </BarElement>
        </BarCenter>
        <BarRight>
          <BarElement>
            <Text variant="body">14:32:07</Text>
          </BarElement>
        </BarRight>
      </BottomBar>
    </div>
  ),
};

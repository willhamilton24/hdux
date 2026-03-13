import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "HDUX/Components/Button",
  component: Button,
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
        <div style={{ padding: 40 }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
  argTypes: {
    color: { control: "color" },
    textColor: { control: "color" },
    cornerColor: { control: "color" },
    cornerLength: { control: { type: "number", min: 4, max: 60 } },
    cornerWidth: { control: { type: "number", min: 1, max: 10 } },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

/* ── Default ───────────────────────────────────────── */

export const Default: Story = {
  args: {
    children: "INITIALIZE",
  },
};

/* ── Multiple Buttons ──────────────────────────────── */

export const ButtonRow: Story = {
  name: "Button Row",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Button>CONFIRM</Button>
      <Button>CANCEL</Button>
      <Button>DEPLOY</Button>
    </div>
  ),
};

/* ── Custom Colors ─────────────────────────────────── */

export const CustomColors: Story = {
  name: "Custom Colors",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Button cornerColor="#ff6f00" textColor="#ffca28">
        CAUTION
      </Button>
      <Button cornerColor="#00e676" textColor="#69f0ae">
        SUCCESS
      </Button>
      <Button color="#ff1744">
        ABORT
      </Button>
    </div>
  ),
};

/* ── Large Corners ─────────────────────────────────── */

export const LargeCorners: Story = {
  name: "Large Corners",
  args: {
    children: "EXECUTE",
    cornerLength: 20,
    cornerWidth: 3,
  },
};

/* ── Disabled ──────────────────────────────────────── */

export const Disabled: Story = {
  args: {
    children: "OFFLINE",
    disabled: true,
  },
};

/* ── With Click Handler ────────────────────────────── */

export const WithClickHandler: Story = {
  name: "With Click Handler",
  args: {
    children: "CLICK ME",
    onClick: () => alert("Button clicked!"),
  },
};

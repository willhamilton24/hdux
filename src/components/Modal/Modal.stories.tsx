import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Modal } from "./Modal";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";

const meta: Meta<typeof Modal> = {
  title: "HDUX/Components/Modal",
  component: Modal,
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
            boxCorners: { length: "14px" },
          },
        }}
      >
        <div style={{ padding: 40 }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>OPEN MODAL</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm Action"
        >
          <Text variant="body">
            This action will reconfigure the network relay. Continue?
          </Text>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <Button onClick={() => setOpen(false)}>CONFIRM</Button>
            <Button onClick={() => setOpen(false)}>CANCEL</Button>
          </div>
        </Modal>
      </>
    );
  },
};

export const TitleOnly: Story = {
  name: "Title Only",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>OPEN</Button>
        <Modal open={open} title="System Alert" onClose={() => setOpen(false)}>
          <Text variant="body">
            Sector grid 7 has gone dark. Manual override required.
          </Text>
        </Modal>
      </>
    );
  },
};

export const NoTitle: Story = {
  name: "No Title",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>OPEN BARE MODAL</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <Text variant="body">
            A minimal modal with no title bar.
          </Text>
        </Modal>
      </>
    );
  },
};

export const WarnColor: Story = {
  name: "Warning Color",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button cornerColor="#ff1744" textColor="#ff1744" onClick={() => setOpen(true)}>
          CRITICAL ALERT
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Critical Fault Detected"
          color="#ff1744"
        >
          <Text variant="body">
            Reactor coolant pressure is below threshold. Immediate shutdown
            recommended.
          </Text>
          <div style={{ marginTop: 20 }}>
            <Button color="#ff1744" onClick={() => setOpen(false)}>
              ACKNOWLEDGE
            </Button>
          </div>
        </Modal>
      </>
    );
  },
};

export const Wide: Story = {
  name: "Wide",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>OPEN WIDE MODAL</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Mission Debrief"
          width={720}
        >
          <Text variant="body">
            All objectives completed within the operation window. Asset
            extraction successful. No hostile contacts remaining in the
            designated grid sectors.
          </Text>
          <Text variant="body" style={{ marginTop: 12 }}>
            Secondary objective: data package retrieved intact. Analysis
            queued for 0600 briefing.
          </Text>
        </Modal>
      </>
    );
  },
};

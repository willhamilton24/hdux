import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { HduxProProvider } from "../../ProProvider";
import { GaugeCluster } from "./GaugeCluster";

const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";

const meta: Meta<typeof GaugeCluster> = {
  title: "HDUX Pro/GaugeCluster",
  component: GaugeCluster,
  decorators: [
    (Story) => (
      <HduxThemeProvider
        config={{
          defaultMode: "dark",
          master: {
            mainColor: "#00d4ff",
            textColor: "#e0e0e0",
            background: "#0a0a1a",
            customColors: { success: "#00e676", failure: "#ff1744", caution: "#ff6f00" },
            typography: { mainFont: '"Quantico", system-ui, sans-serif' },
            borderWidth: "2px",
            boxCorners: { length: "12px" },
          },
        }}
      >
        <HduxProProvider licenseKey={PRO_KEY}>
          <div style={{ padding: 40, background: "#0a0a1a" }}>
            <Story />
          </div>
        </HduxProProvider>
      </HduxThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof GaugeCluster>;

export const Default: Story = {
  args: {
    title: "SYSTEM VITALS",
    gauges: [
      { label: "CPU", value: 68 },
      { label: "MEM", value: 82 },
      { label: "DISK", value: 44 },
      { label: "NET", value: 91 },
    ],
    columns: 2,
  },
};

export const CustomColors: Story = {
  name: "Custom Colors",
  args: {
    title: "SHIP SYSTEMS",
    gauges: [
      { label: "HULL", value: 88, color: "#00d4ff" },
      { label: "SHIELD", value: 34, color: "#7b2fff" },
      { label: "FUEL", value: 22, color: "#ff6f00" },
      { label: "OXYGEN", value: 96, color: "#00e676" },
    ],
    columns: 4,
    gaugeSize: 90,
  },
};

export const LiveUpdate: Story = {
  name: "Live Update",
  render: () => {
    const [vals, setVals] = useState([68, 82, 44, 91]);
    useEffect(() => {
      const id = setInterval(() => {
        setVals((v) => v.map((n) => Math.max(5, Math.min(99, n + Math.round((Math.random() - 0.5) * 12)))));
      }, 1000);
      return () => clearInterval(id);
    }, []);
    return (
      <GaugeCluster
        title="LIVE TELEMETRY"
        gauges={["CPU", "MEM", "DISK", "NET"].map((label, i) => ({ label, value: vals[i] }))}
        columns={2}
        healthAggregation="avg"
      />
    );
  },
};

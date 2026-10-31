import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { HduxProProvider } from "../../ProProvider";
import { AreaChart } from "./AreaChart";

import { mixedSeries } from "./AreaChart.fixtures";

const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";

const meta: Meta<typeof AreaChart> = {
  title: "HDUX Pro/AreaChart",
  component: AreaChart,
  decorators: [
    (Story, context) => {
      const content = (
        <div style={{ padding: 40, background: "#0a0a1a" }}>
          <Story />
        </div>
      );
      return (
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
          {context.parameters?.proLicense === false ? (
            content
          ) : (
            <HduxProProvider licenseKey={PRO_KEY}>{content}</HduxProProvider>
          )}
        </HduxThemeProvider>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof AreaChart>;

export const Default: Story = {
  args: {
    data: [12, 28, 45, 38, 60, 52, 71, 65, 88, 74],
    title: "THROUGHPUT",
    height: 160,
  },
};

export const MultiSeries: Story = {
  name: "Multi-Series",
  render: () => (
    <AreaChart
      title="SYSTEM TELEMETRY"
      width={560}
      height={200}
      series={[
        {
          id: "cpu",
          label: "CPU",
          color: "#00d4ff",
          data: [22, 35, 55, 48, 68, 72, 60, 68, 75, 80].map((v, i) => ({
            value: v,
            label: `${i * 2}:00`,
          })),
        },
        {
          id: "mem",
          label: "MEM",
          color: "#7b2fff",
          data: [60, 65, 70, 72, 75, 80, 82, 82, 85, 83].map((v, i) => ({
            value: v,
            label: `${i * 2}:00`,
          })),
        },
      ]}
    />
  ),
};

export const Animated: Story = {
  name: "Live Update",
  render: () => {
    const [data, setData] = useState<number[]>([30, 45, 38, 52, 47]);
    useEffect(() => {
      const id = setInterval(() => {
        setData((prev) => [...prev.slice(-9), Math.round(20 + Math.random() * 75)]);
      }, 1200);
      return () => clearInterval(id);
    }, []);
    return (
      <AreaChart
        title="LIVE SIGNAL"
        data={data}
        color="#00e676"
        width={480}
        height={160}
        animate
        showDots
      />
    );
  },
};

export const NoLicense: Story = {
  name: "No License (gate shown)",
  parameters: { proLicense: false },
  args: {
    data: [12, 28, 45, 38, 60, 52, 71],
    title: "THROUGHPUT",
    height: 160,
  },
};

export const Loading: Story = {
  args: { title: "THROUGHPUT", loading: true, data: [12, 28, 45] },
};

export const Empty: Story = {
  args: { title: "THROUGHPUT", data: [] },
};

export const SinglePoint: Story = {
  args: { title: "THROUGHPUT", data: [{ label: "09:00", value: 12 }] },
};

export const MixedSeries: Story = {
  args: { title: "SYSTEM TELEMETRY", series: mixedSeries, showDots: false },
};

export const CustomMessages: Story = {
  args: { title: "THROUGHPUT", series: [], emptyMessage: "No samples in this time range" },
};

export const StateTransitions: Story = {
  render: () => {
    const [state, setState] = useState("loading");
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["loading", "empty", "single", "ready"].map((value) => (
            <button key={value} onClick={() => setState(value)}>{value}</button>
          ))}
        </div>
        <AreaChart title="THROUGHPUT" loading={state === "loading"}
          data={state === "empty" ? [] : state === "single" ? [12] : [12, 28, 45]} />
      </div>
    );
  },
};

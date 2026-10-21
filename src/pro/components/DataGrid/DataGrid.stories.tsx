import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { HduxProProvider } from "../../ProProvider";
import { DataGrid } from "./DataGrid";

const PRO_KEY = "HDUX-PRO-TEST-0000-0000-0000";

const AGENTS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  callsign: `UNIT-${String(i + 1).padStart(3, "0")}`,
  status: (["ACTIVE", "STANDBY", "OFFLINE"] as const)[i % 3],
  zone: `SECTOR-${String.fromCharCode(65 + (i % 6))}`,
  threat: Math.round(10 + Math.random() * 90),
}));

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#00e676", STANDBY: "#ff6f00", OFFLINE: "#ff1744",
};

const meta: Meta<typeof DataGrid> = {
  title: "HDUX Pro/DataGrid",
  component: DataGrid,
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

type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {
  render: () => (
    <DataGrid
      columns={[
        { key: "id", header: "ID", width: 50, sortable: true },
        { key: "callsign", header: "CALLSIGN", sortable: true },
        {
          key: "status",
          header: "STATUS",
          sortable: true,
          render: (val) => (
            <span style={{ color: STATUS_COLORS[val as string] ?? "#00d4ff" }}>
              {val as string}
            </span>
          ),
        },
        { key: "zone", header: "ZONE", sortable: true },
        {
          key: "threat",
          header: "THREAT",
          sortable: true,
          render: (val) => {
            const n = val as number;
            const c = n > 70 ? "#ff1744" : n > 40 ? "#ff6f00" : "#00e676";
            return <span style={{ color: c }}>{n}%</span>;
          },
        },
      ]}
      rows={AGENTS}
      pageSize={8}
      searchable
    />
  ),
};

export const NoSearch: Story = {
  name: "No Search / No Pagination",
  render: () => (
    <DataGrid
      columns={[
        { key: "callsign", header: "AGENT" },
        { key: "status", header: "STATUS", sortable: true },
        { key: "zone", header: "ZONE" },
      ]}
      rows={AGENTS.slice(0, 6)}
      pageSize={0}
      searchable={false}
    />
  ),
};

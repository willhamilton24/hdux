import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { licensed } from "../../../../.storybook/licenseFixtures";
import { DataGrid } from "./DataGrid";
import type { DataGridColumn } from "./types";


const AGENTS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  callsign: `UNIT-${String(i + 1).padStart(3, "0")}`,
  status: (["ACTIVE", "STANDBY", "OFFLINE"] as const)[i % 3],
  zone: `SECTOR-${String.fromCharCode(65 + (i % 6))}`,
  threat: Math.round(10 + Math.random() * 90),
}));

type Agent = (typeof AGENTS)[number];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#00e676", STANDBY: "#ff6f00", OFFLINE: "#ff1744",
};

const COLUMNS: DataGridColumn<Agent>[] = [
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
];

const meta: Meta<typeof DataGrid> = {
  title: "HDUX Pro/DataGrid",
  component: DataGrid,
  decorators: [
    licensed,
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
        <div style={{ padding: 40, background: "#0a0a1a" }}>
          <Story />
        </div>
      </HduxThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {
  render: () => (
    <DataGrid columns={COLUMNS} rows={AGENTS} pageSize={8} searchable />
  ),
};

export const NoSearch: Story = {
  name: "No Search / No Pagination",
  render: () => (
    <DataGrid
      columns={COLUMNS.slice(1, 4)}
      rows={AGENTS.slice(0, 6)}
      pageSize={0}
      searchable={false}
    />
  ),
};

export const Loading: Story = {
  name: "Loading State",
  render: () => (
    <DataGrid
      columns={COLUMNS}
      rows={[]}
      loading
      loadingMessage="SYNCING AGENT ROSTER…"
    />
  ),
};

export const ErrorState: Story = {
  name: "Error State / Retry",
  render: function ErrorStory() {
    const [retries, setRetries] = useState(0);
    return (
      <div>
        <DataGrid
          columns={COLUMNS}
          rows={[]}
          error="UPLINK LOST — UNABLE TO RETRIEVE ROSTER"
          onRetry={() => setRetries((r) => r + 1)}
        />
        {retries > 0 && (
          <p
            style={{
              color: "#00d4ff",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              marginTop: 8,
              opacity: 0.6,
            }}
          >
            RETRY ATTEMPTS: {retries}
          </p>
        )}
      </div>
    );
  },
};

export const ErrorNoRetry: Story = {
  name: "Error State / No Retry",
  render: () => (
    <DataGrid
      columns={COLUMNS}
      rows={[]}
      error
      errorMessage="DATA SOURCE UNAVAILABLE"
    />
  ),
};

export const EmptyData: Story = {
  name: "Empty Data State",
  render: () => (
    <DataGrid
      columns={COLUMNS}
      rows={[]}
      emptyMessage="NO AGENTS ASSIGNED TO THIS SECTOR"
    />
  ),
};

export const NoFilterMatch: Story = {
  name: "No Filter Match State",
  render: () => (
    <DataGrid
      columns={COLUMNS}
      rows={AGENTS.slice(0, 8)}
      pageSize={8}
      searchable
      defaultQuery="XXXXXXXXX"
      noMatchMessage="NO AGENTS MATCH FILTER CRITERIA"
    />
  ),
};

// Manual completion keeps each asynchronous state inspectable without a network.
export const RetryLifecycle: Story = {
  render: function RetryLifecycleStory() {
    const [state, setState] = useState("error");
    return (
      <div>
        <button onClick={() => setState("error")}>Reset error</button>
        <button onClick={() => setState("loading")}>Start external refresh</button>
        <button onClick={() => setState("populated")}>Complete with rows</button>
        <button onClick={() => setState("empty")}>Complete empty</button>
        <button onClick={() => setState("error")}>Complete with error</button>
        <DataGrid columns={COLUMNS} rows={state === "populated" ? AGENTS : []}
          loading={state === "loading"} error={state === "error"}
          onRetry={() => setState("loading")} />
      </div>
    );
  },
};

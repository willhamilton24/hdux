import type { Meta, StoryObj } from "@storybook/react-vite";
import { HduxThemeProvider } from "../../theme/ThemeProvider";
import { Table } from "./Table";

const meta: Meta<typeof Table> = {
  title: "HDUX/Components/Table",
  component: Table,
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
};
export default meta;

type Story = StoryObj<typeof Table>;

interface AgentRow {
  id: string;
  name: string;
  status: string;
  sector: string;
  signal: number;
}

const AGENTS: AgentRow[] = [
  { id: "AGT-001", name: "AXIOM", status: "ACTIVE", sector: "GRID-7", signal: 98 },
  { id: "AGT-002", name: "HERON", status: "STANDBY", sector: "GRID-3", signal: 74 },
  { id: "AGT-003", name: "SPECTER", status: "ACTIVE", sector: "GRID-11", signal: 91 },
  { id: "AGT-004", name: "KESTREL", status: "OFFLINE", sector: "GRID-2", signal: 0 },
  { id: "AGT-005", name: "NOVA", status: "ACTIVE", sector: "GRID-9", signal: 86 },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#00e676",
  STANDBY: "#ff6f00",
  OFFLINE: "#ff1744",
};

export const Default: Story = {
  render: () => (
    <Table<AgentRow>
      columns={[
        { key: "id", header: "ID", width: 100 },
        { key: "name", header: "Agent" },
        { key: "sector", header: "Sector" },
        { key: "signal", header: "Signal %" },
        {
          key: "status",
          header: "Status",
          render: (val) => (
            <span style={{ color: STATUS_COLORS[val as string] ?? "inherit" }}>
              {val as string}
            </span>
          ),
        },
      ]}
      rows={AGENTS}
    />
  ),
};

export const Clickable: Story = {
  name: "Clickable Rows",
  render: () => (
    <Table<AgentRow>
      columns={[
        { key: "id", header: "ID", width: 100 },
        { key: "name", header: "Agent" },
        { key: "sector", header: "Sector" },
        {
          key: "status",
          header: "Status",
          render: (val) => (
            <span style={{ color: STATUS_COLORS[val as string] ?? "inherit" }}>
              {val as string}
            </span>
          ),
        },
      ]}
      rows={AGENTS}
      onRowClick={(row) => alert(`Selected: ${row.name}`)}
    />
  ),
};

export const EmptyState: Story = {
  name: "Empty State",
  render: () => (
    <Table<AgentRow>
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Agent" },
        { key: "status", header: "Status" },
      ]}
      rows={[]}
      emptyText="NO AGENTS FOUND"
    />
  ),
};

export const CustomColor: Story = {
  name: "Custom Color",
  render: () => (
    <Table<AgentRow>
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Agent" },
        { key: "sector", header: "Sector" },
        { key: "signal", header: "Signal %" },
      ]}
      rows={AGENTS}
      color="#ff6f00"
    />
  ),
};

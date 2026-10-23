// HDUX Pro — requires a valid license key
// Get one at https://hdux.dev/pro

// License system
export { HduxProProvider } from "./ProProvider";
export type { HduxProProviderProps } from "./ProProvider";
export { useProLicense } from "./ProContext";
export type { HduxProContextValue, ProLicenseStatus } from "./ProContext";
export { validateLicense, validateLicenseFormat } from "./validateLicense";

// Pro widgets
export { AreaChart } from "./components/AreaChart";
export type {
  AreaChartProps,
  AreaChartSeries,
  AreaChartDataPoint,
} from "./components/AreaChart";

export { DataGrid } from "./components/DataGrid";
export type {
  DataGridProps,
  DataGridColumn,
  SortDirection,
} from "./components/DataGrid";

export { GaugeCluster } from "./components/GaugeCluster";
export type { GaugeClusterProps, GaugeSpec } from "./components/GaugeCluster";

// Pro templates
export { OpsDashboard } from "./templates/OpsDashboard";
export type {
  OpsDashboardProps,
  OpsMetric,
  OpsChartSeries,
  OpsTableRow,
} from "./templates/OpsDashboard";

export { GameLobby } from "./templates/GameLobby";
export type {
  GameLobbyProps,
  LobbyPlayer,
  LobbyMatchInfo,
} from "./templates/GameLobby";

export { LandingPage } from "./templates/LandingPage";
export type { LandingPageProps } from "./templates/LandingPage";

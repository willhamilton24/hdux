import { useEffect, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { TopBar, BottomBar, BarLeft, BarRight, BarElement, ThemeSelector } from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { AreaChart } from "../../components/AreaChart";
import { GaugeCluster } from "../../components/GaugeCluster";
import { DataGrid } from "../../components/DataGrid";
import { ProGate } from "../../ProGate";
import type { OpsDashboardProps } from "./types";
import "./OpsDashboard.css";

const DEFAULT_METRICS = [
  { label: "CPU", value: 68 },
  { label: "MEM", value: 82 },
  { label: "DISK", value: 44 },
  { label: "NET", value: 91 },
];

const DEFAULT_LABELS = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00"];
const DEFAULT_SERIES = [
  { label: "CPU %",  data: [22, 35, 55, 48, 68, 72, 60, 68], color: "#00d4ff" },
  { label: "MEM %",  data: [60, 65, 70, 72, 75, 80, 82, 82], color: "#7b2fff" },
];

const DEFAULT_ROWS = [
  { id: 1, time: "14:22:01", level: "INFO",  service: "api-gateway",    message: "Health check OK" },
  { id: 2, time: "14:21:44", level: "WARN",  service: "db-replica",     message: "Replication lag 180ms" },
  { id: 3, time: "14:20:11", level: "INFO",  service: "auth-service",   message: "Token issued uid=8821" },
  { id: 4, time: "14:19:55", level: "ERROR", service: "worker-3",       message: "Job timeout after 30s" },
  { id: 5, time: "14:18:30", level: "INFO",  service: "cache",          message: "Eviction cycle complete" },
  { id: 6, time: "14:17:12", level: "DEBUG", service: "api-gateway",    message: "Rate limit window reset" },
];

const LOG_COLUMNS = [
  { key: "time" as const, header: "TIME", width: 90 },
  {
    key: "level" as const,
    header: "LEVEL",
    width: 70,
    sortable: true,
    render: (val: unknown) => {
      const colors: Record<string, string> = {
        ERROR: "#ff1744", WARN: "#ff6f00", INFO: "#00d4ff", DEBUG: "#7b2fff",
      };
      return <span style={{ color: colors[val as string] ?? "#00d4ff" }}>{val as string}</span>;
    },
  },
  { key: "service" as const, header: "SERVICE", sortable: true },
  { key: "message" as const, header: "MESSAGE" },
];

type LogRow = typeof DEFAULT_ROWS[number];

function OpsDashboardInner({
  title = "OPS DASHBOARD",
  systemName = "HDUX CONTROL",
  metrics = DEFAULT_METRICS,
  chartSeries = DEFAULT_SERIES,
  chartLabels = DEFAULT_LABELS,
  tableRows = DEFAULT_ROWS,
  className,
  style,
}: OpsDashboardProps) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(id);
  }, []);

  return (
    <HduxThemeProvider
      config={{
        defaultMode: "dark",
        master: {
          mainColor: "#00d4ff",
          textColor: "#e0e0e0",
          background: "#06080f",
          customColors: { success: "#00e676", failure: "#ff1744", caution: "#ff6f00" },
          typography: { mainFont: '"Quantico", system-ui, monospace' },
          borderWidth: "1px",
          boxCorners: { length: "14px", width: "2px" },
        },
      }}
    >
      <div
        className={["hdux-ops-dashboard", className].filter(Boolean).join(" ")}
        style={style}
      >
        <TopBar>
          <BarLeft>
            <BarElement>
              <Text variant="body">{systemName}</Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            <BarElement>
              <Text variant="body">{title}</Text>
            </BarElement>
            <BarElement borderless>
              <ThemeSelector size={28} />
            </BarElement>
          </BarRight>
        </TopBar>

        <div className="hdux-ops-dashboard__body">
          {/* Left column: gauges */}
          <div className="hdux-ops-dashboard__sidebar">
            <Box
              animation="standard"
              hasLoaded={loaded}
              fullBorder
            >
              <GaugeCluster
                title="SYSTEM VITALS"
                gauges={metrics.map((m) => ({
                  label: m.label,
                  value: m.value,
                  max: m.max ?? 100,
                  color: m.color,
                  formatValue: m.unit ? (v) => `${v}${m.unit}` : undefined,
                }))}
                columns={2}
                gaugeSize={90}
              />
            </Box>
          </div>

          {/* Main area */}
          <div className="hdux-ops-dashboard__main">
            <div className="hdux-ops-dashboard__charts">
              {chartSeries.map((s, i) => (
                <Box key={i} animation="horizontalFirst" hasLoaded={loaded} fullBorder>
                  <AreaChart
                    title={s.label}
                    data={s.data.map((v, j) => ({ value: v, label: chartLabels[j] ?? String(j) }))}
                    color={s.color}
                    width={320}
                    height={140}
                    showGrid
                    animate
                  />
                </Box>
              ))}
            </div>

            <Box animation="verticalFirst" hasLoaded={loaded} fullBorder>
              <DataGrid<LogRow>
                columns={LOG_COLUMNS}
                rows={tableRows as LogRow[]}
                pageSize={5}
                searchable
              />
            </Box>
          </div>
        </div>

        <BottomBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">HDUX PRO</Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            <BarElement>
              <Text variant="body">OPERATIONAL</Text>
            </BarElement>
          </BarRight>
        </BottomBar>
      </div>
    </HduxThemeProvider>
  );
}

export function OpsDashboard(props: OpsDashboardProps) {
  return (
    <ProGate componentName="OpsDashboard">
      <OpsDashboardInner {...props} />
    </ProGate>
  );
}

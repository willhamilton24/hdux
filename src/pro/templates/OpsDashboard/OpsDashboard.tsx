import { useEffect, useRef, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { TopBar, BottomBar, BarLeft, BarCenter, BarRight, BarElement, ThemeSelector } from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { AreaChart } from "../../components/AreaChart";
import { GaugeCluster } from "../../components/GaugeCluster";
import { DataGrid } from "../../components/DataGrid";
import { ProGate } from "../../ProGate";
import type { OpsDashboardProps } from "./types";
import "./OpsDashboard.css";

const DEFAULT_METRICS = [
  { label: "CPU",  value: 68 },
  { label: "MEM",  value: 82 },
  { label: "DISK", value: 44 },
  { label: "NET",  value: 91 },
];

const DEFAULT_LABELS = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00"];
const DEFAULT_SERIES = [
  { label: "CPU %", data: [22, 35, 55, 48, 68, 72, 60, 68], color: "#00d4ff" },
  { label: "MEM %", data: [60, 65, 70, 72, 75, 80, 82, 82], color: "#7b2fff" },
];

const DEFAULT_ROWS = [
  { id: 1,  time: "14:22:01", level: "INFO",  service: "api-gateway",  message: "Health check OK" },
  { id: 2,  time: "14:21:44", level: "WARN",  service: "db-replica",   message: "Replication lag 180ms" },
  { id: 3,  time: "14:20:11", level: "INFO",  service: "auth-service", message: "Token issued uid=8821" },
  { id: 4,  time: "14:19:55", level: "ERROR", service: "worker-3",     message: "Job timeout after 30s" },
  { id: 5,  time: "14:18:30", level: "INFO",  service: "cache",        message: "Eviction cycle complete" },
  { id: 6,  time: "14:17:12", level: "DEBUG", service: "api-gateway",  message: "Rate limit window reset" },
  { id: 7,  time: "14:16:05", level: "INFO",  service: "scheduler",    message: "Cron job queue-flush ran" },
  { id: 8,  time: "14:14:50", level: "WARN",  service: "worker-1",     message: "Memory headroom < 15%" },
  { id: 9,  time: "14:13:29", level: "INFO",  service: "cdn-edge",     message: "Cache purge confirmed" },
  { id: 10, time: "14:12:07", level: "ERROR", service: "worker-2",     message: "Unhandled promise rejection" },
];

const SERVICE_NODES = [
  { name: "api-gateway",  status: "ok"   as const },
  { name: "auth-service", status: "ok"   as const },
  { name: "db-primary",   status: "ok"   as const },
  { name: "db-replica",   status: "warn" as const },
  { name: "cache",        status: "ok"   as const },
  { name: "worker-1",     status: "warn" as const },
  { name: "worker-2",     status: "err"  as const },
  { name: "worker-3",     status: "err"  as const },
  { name: "scheduler",    status: "ok"   as const },
  { name: "cdn-edge",     status: "ok"   as const },
];

const NODE_COLORS = { ok: "#00e676", warn: "#ff6f00", err: "#ff1744" } as const;

const LOG_COLUMNS = [
  { key: "time"    as const, header: "TIME",    width: 88 },
  {
    key: "level" as const,
    header: "LEVEL",
    width: 68,
    sortable: true,
    render: (val: unknown) => {
      const colors: Record<string, string> = {
        ERROR: "#ff1744", WARN: "#ff6f00", INFO: "#00d4ff", DEBUG: "#7b2fff",
      };
      return <span style={{ color: colors[val as string] ?? "#00d4ff" }}>{val as string}</span>;
    },
  },
  { key: "service" as const, header: "SERVICE", width: 130, sortable: true },
  { key: "message" as const, header: "MESSAGE" },
];

type LogRow = typeof DEFAULT_ROWS[number];

function useTickingMetrics(initial: number[]) {
  const [values, setValues] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) =>
        prev.map((v) => Math.min(99, Math.max(3, Math.round(v + (Math.random() - 0.48) * 6))))
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return values;
}

function useScrollingChart(seed: number[]) {
  const [data, setData] = useState(seed);
  const seedRef = useRef(seed);
  seedRef.current = seed;
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1] ?? 50;
        const next = Math.min(99, Math.max(2, Math.round(last + (Math.random() - 0.46) * 12)));
        return [...prev.slice(1), next];
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return data;
}

function useClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("en-GB"));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("en-GB")), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

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

  const clock = useClock();
  const liveMetricValues = useTickingMetrics(metrics.map((m) => m.value));

  const cpuData0 = useScrollingChart(chartSeries[0]?.data ?? DEFAULT_SERIES[0].data);
  const cpuData1 = useScrollingChart(chartSeries[1]?.data ?? DEFAULT_SERIES[1].data);
  const liveChartData = [
    { ...((chartSeries[0] ?? DEFAULT_SERIES[0])), data: cpuData0 },
    { ...((chartSeries[1] ?? DEFAULT_SERIES[1])), data: cpuData1 },
  ];

  const errCount   = SERVICE_NODES.filter((n) => n.status === "err").length;
  const warnCount  = SERVICE_NODES.filter((n) => n.status === "warn").length;
  const statusText = errCount > 0 ? `${errCount} ERROR` : warnCount > 0 ? `${warnCount} WARN` : "OPERATIONAL";
  const statusColor = errCount > 0 ? "#ff1744" : warnCount > 0 ? "#ff6f00" : "#00e676";

  const liveMetrics = metrics.map((m, i) => ({
    ...m,
    value: liveMetricValues[i] ?? m.value,
  }));

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
          <BarCenter>
            <BarElement borderless>
              <span className="hdux-ops-dashboard__clock">{clock}</span>
            </BarElement>
          </BarCenter>
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
          {/* ── Left sidebar ───────────────────────────── */}
          <div className="hdux-ops-dashboard__sidebar">
            <Box animation="standard" hasLoaded={loaded} fullBorder>
              <GaugeCluster
                title="SYSTEM VITALS"
                gauges={liveMetrics.map((m) => ({
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

            {/* Service health nodes */}
            <Box animation="verticalFirst" hasLoaded={loaded} fullBorder>
              <div className="hdux-ops-dashboard__nodes">
                <Text variant="subheading">SERVICE MAP</Text>
                <div className="hdux-ops-dashboard__node-grid">
                  {SERVICE_NODES.map((node) => (
                    <div key={node.name} className="hdux-ops-dashboard__node">
                      <span
                        className="hdux-ops-dashboard__node-dot"
                        style={{ background: NODE_COLORS[node.status] }}
                      />
                      <span className="hdux-ops-dashboard__node-name">{node.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Box>
          </div>

          {/* ── Main area ──────────────────────────────── */}
          <div className="hdux-ops-dashboard__main">
            <div className="hdux-ops-dashboard__charts">
              {liveChartData.map((s, i) => (
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
                pageSize={6}
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
              <span className="hdux-ops-dashboard__status" style={{ color: statusColor }}>
                ● {statusText}
              </span>
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

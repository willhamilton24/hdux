import { useEffect, useRef, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { TopBar, BottomBar, BarLeft, BarCenter, BarRight, BarElement, ThemeSelector } from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { AreaChart } from "../../components/AreaChart";
import { GaugeCluster } from "../../components/GaugeCluster";
import { DataGrid } from "../../components/DataGrid";
import { ProGate } from "../../ProGate";
import type { OpsDashboardProps, OpsMetric } from "./types";
import "../templates.css";
import "./OpsDashboard.css";
import "../responsive.css";

const DEFAULT_METRICS = [
  { label: "CPU",  value: 68 },
  { label: "MEM",  value: 82 },
  { label: "DISK", value: 44 },
  { label: "NET",  value: 91 },
];

const DEFAULT_LABELS = ["T-7", "T-6", "T-5", "T-4", "T-3", "T-2", "T-1", "NOW"];
// Invalid maxima use the same 100-unit fallback for rendering and thresholds.
function metricMax(metric: OpsMetric) {
  return Number.isFinite(metric.max) && metric.max! > 0 ? metric.max! : 100;
}
function metricRatio(metric: OpsMetric) {
  return metric.value / metricMax(metric);
}

const SEED_ROWS = [
  { id: 1, time: "14:22:01", level: "INFO",  service: "api-gateway",  message: "Health check OK" },
  { id: 2, time: "14:21:44", level: "WARN",  service: "db-replica",   message: "Replication lag 180ms" },
  { id: 3, time: "14:20:11", level: "INFO",  service: "auth-service", message: "Token issued uid=8821" },
  { id: 4, time: "14:19:55", level: "ERROR", service: "worker-3",     message: "Job timeout after 30s" },
  { id: 5, time: "14:18:30", level: "INFO",  service: "cache",        message: "Eviction cycle complete" },
  { id: 6, time: "14:17:12", level: "DEBUG", service: "api-gateway",  message: "Rate limit window reset" },
  { id: 7, time: "14:16:50", level: "INFO",  service: "scheduler",    message: "Cron job started: backup" },
  { id: 8, time: "14:16:01", level: "WARN",  service: "auth-service", message: "5 failed logins ip=10.0.0.4" },
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
  { key: "time" as const, header: "TIME", width: 88 },
  {
    key: "level" as const,
    header: "LEVEL",
    width: 68,
    sortable: true,
    render: (val: unknown) => {
      const colors: Record<string, string> = {
        ERROR: "var(--hdux-demo-red, #ff1744)", WARN: "var(--hdux-demo-orange, #ff6f00)", INFO: "var(--hdux-demo-cyan, #00d4ff)", DEBUG: "var(--hdux-demo-purple, #7b2fff)",
      };
      return (
        <span style={{ color: colors[val as string] ?? "var(--hdux-demo-cyan, #00d4ff)", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
          {val as string}
        </span>
      );
    },
  },
  { key: "service" as const, header: "SERVICE", width: 130, sortable: true },
  { key: "message" as const, header: "MESSAGE" },
];

type LogRow = typeof SEED_ROWS[number];

function jitter(base: number, range = 8) {
  return Math.round(Math.min(100, Math.max(1, base + (Math.random() - 0.5) * range * 2)));
}

function useOpsDashboardLiveData(
  demoMode: boolean,
  externalMetrics?: OpsDashboardProps["metrics"],
  externalSeries?: OpsDashboardProps["chartSeries"],
  externalLabels?: OpsDashboardProps["chartLabels"],
  externalRows?: OpsDashboardProps["tableRows"],
) {
  const isControlled =
    !demoMode || !!externalMetrics || !!externalSeries || !!externalLabels || !!externalRows;

  const [liveMetrics, setLiveMetrics] = useState<OpsMetric[]>(DEFAULT_METRICS.map((m) => ({ ...m })));
  const [liveHistory, setLiveHistory] = useState({
    cpu: [22, 35, 55, 48, 68, 72, 60, 68],
    mem: [60, 65, 70, 72, 75, 80, 82, 82],
  });
  const [uptimeSec, setUptimeSec] = useState(0);
  const nextIdRef = useRef(SEED_ROWS.length + 1);

  const [liveRows, setLiveRows] = useState<LogRow[]>(SEED_ROWS);

  useEffect(() => {
    if (isControlled) return;
    const id = setInterval(() => {
      setLiveMetrics((prev) =>
        prev.map((m) => {
          const base = m.label === "CPU" ? 65 : m.label === "MEM" ? 78 : m.label === "NET" ? 85 : 44;
          return { ...m, value: jitter(base, 9) };
        })
      );
      setLiveHistory((prev) => ({
        cpu: [...prev.cpu.slice(1), jitter(65, 10)],
        mem: [...prev.mem.slice(1), jitter(78, 6)],
      }));
    }, 2500);
    return () => clearInterval(id);
  }, [isControlled]);

  useEffect(() => {
    if (isControlled) return;
    const id = setInterval(() => {
      const now = new Date();
      const ts = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
      ].join(":");
      const LIVE_EVENTS = [
        { level: "INFO" as const, service: "api-gateway",  message: "Health check OK" },
        { level: "DEBUG" as const, service: "metrics",     message: "Scrape completed in 4ms" },
        { level: "INFO" as const, service: "auth-service", message: "Token refreshed uid=8821" },
        { level: "WARN" as const, service: "db-replica",   message: "Replication lag spiked" },
        { level: "INFO" as const, service: "cache",        message: "Eviction cycle complete" },
      ];
      const template = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      const row: LogRow = { id: nextIdRef.current++, time: ts, ...template };
      setLiveRows((prev) => [row, ...prev].slice(0, 20));
    }, 4000);
    return () => clearInterval(id);
  }, [isControlled]);

  useEffect(() => {
    const id = setInterval(() => setUptimeSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const metrics = externalMetrics ?? (demoMode ? liveMetrics : []);
  const chartSeries = externalSeries ?? (demoMode ? [
    { label: "CPU %", data: liveHistory.cpu, color: "var(--hdux-demo-cyan, #00d4ff)" },
    { label: "MEM %", data: liveHistory.mem, color: "var(--hdux-demo-purple, #7b2fff)" },
  ] : []);
  const chartLabels = externalLabels ?? DEFAULT_LABELS;
  const tableRows = externalRows ? (externalRows as LogRow[]) : demoMode ? liveRows : [];

  const uptimeStr = [
    String(Math.floor(uptimeSec / 3600)).padStart(2, "0"),
    String(Math.floor((uptimeSec % 3600) / 60)).padStart(2, "0"),
    String(uptimeSec % 60).padStart(2, "0"),
  ].join(":");

  const hasAlert = metrics.some((m) => metricRatio(m) > 0.88);

  return { metrics, chartSeries, chartLabels, tableRows, uptimeStr, hasAlert };
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
  demoMode = false,
  serviceNodes = demoMode ? SERVICE_NODES : [],
  metrics: extMetrics,
  chartSeries: extSeries,
  chartLabels: extLabels,
  tableRows: extRows,
  className,
  style,
}: OpsDashboardProps) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(id);
  }, []);

  const { metrics, chartSeries, chartLabels, tableRows, uptimeStr, hasAlert } =
    useOpsDashboardLiveData(demoMode, extMetrics, extSeries, extLabels, extRows);

  const clock = useClock();
  const errCount   = serviceNodes.filter((n) => n.status === "err").length;
  const warnCount  = serviceNodes.filter((n) => n.status === "warn").length;
  const statusText = errCount > 0 ? `${errCount} ERROR` : warnCount > 0 ? `${warnCount} WARN` : serviceNodes.length ? "OPERATIONAL" : "NO SERVICE DATA";
  const statusColor = errCount > 0 ? "#ff1744" : warnCount > 0 ? "#ff6f00" : "#00e676";

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
        <TopBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">{systemName}</Text>
            </BarElement>
            {hasAlert && (
              <BarElement color="var(--hdux-demo-red, #ff1744)">
                <Text variant="body" color="var(--hdux-demo-red, #ff1744)">⚠ ALERT</Text>
              </BarElement>
            )}
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
                gauges={metrics.map((m) => ({
                  label: m.label,
                  value: m.value,
                  max: metricMax(m),
                  color:
                    m.color ??
                    (metricRatio(m) > 0.88 ? "var(--hdux-demo-red, #ff1744)" : metricRatio(m) > 0.70 ? "var(--hdux-demo-orange, #ff6f00)" : undefined),
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
                  {serviceNodes.map((node) => (
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
            <BarElement>
              <Text variant="body" color={hasAlert ? "var(--hdux-demo-red, #ff1744)" : "var(--hdux-demo-green, #00e676)"}>
                {hasAlert ? "DEGRADED" : "OPERATIONAL"}
              </Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            <BarElement>
              <Text variant="body">UPTIME {uptimeStr}</Text>
            </BarElement>
            <BarElement>
              <span className="hdux-ops-dashboard__status" style={{ color: statusColor }}>● {statusText}</span>
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

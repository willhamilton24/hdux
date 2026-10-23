import { useEffect, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import {
  TopBar, BottomBar,
  BarLeft, BarRight, BarCenter,
  BarElement, ThemeSelector,
} from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { Button } from "../../../components/Button";
import { StatBar } from "../../../components/StatBar";
import { RadialMeter } from "../../../components/RadialMeter";
import { AreaChart } from "../../components/AreaChart";
import { GaugeCluster } from "../../components/GaugeCluster";
import { DataGrid } from "../../components/DataGrid";
import type { LandingPageProps } from "./types";
import "./LandingPage.css";

const CHECKOUT_ENDPOINT = "https://api.hdux.dev/v1/checkout/session";

const LIVE_LABELS = ["T-7", "T-6", "T-5", "T-4", "T-3", "T-2", "T-1", "NOW"];

function jitter(base: number, range: number) {
  return Math.round(Math.min(100, Math.max(1, base + (Math.random() - 0.5) * range * 2)));
}

function makeSeries(bases: number[], range: number) {
  return bases.map((b) => jitter(b, range));
}

function useLiveData() {
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState({
    cpu: [22, 35, 55, 48, 68, 72, 60, 68],
    mem: [60, 65, 70, 72, 75, 80, 82, 82],
    net: [10, 18, 22, 30, 25, 40, 35, 45],
    gauges: [68, 82, 44, 75],
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setHistory((prev) => {
        const next = (arr: number[], base: number) => [
          ...arr.slice(1),
          jitter(base, 10),
        ];
        return {
          cpu:    next(prev.cpu,    65),
          mem:    next(prev.mem,    78),
          net:    next(prev.net,    38),
          gauges: makeSeries([65, 78, 45, 72], 8),
        };
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return { history, tick };
}

const FREE_TIER = [
  "Box — animated corner container",
  "Text — typewriter & sweep animations",
  "TopBar / BottomBar",
  "BarElement — nav unit",
  "Button",
  "Input",
  "Modal",
  "StatBar — animated fill bar",
  "RadialMeter — circular gauge",
  "Table — data table",
  "ThemeSelector",
  "useTheme — hook",
];

const PRO_FEATURES = [
  "AreaChart — multi-series SVG chart",
  "DataGrid — sortable, filterable table",
  "GaugeCluster — radial gauge array",
  "OpsDashboard template",
  "GameLobby template",
  "LandingPage template",
  "Commercial use license",
  "Priority email support",
];

const DOCS_ROWS = [
  { id: 1, component: "Box", category: "Layout", status: "stable", since: "0.1" },
  { id: 2, component: "Text", category: "Typography", status: "stable", since: "0.1" },
  { id: 3, component: "AreaChart", category: "Pro / Chart", status: "stable", since: "0.2" },
  { id: 4, component: "GaugeCluster", category: "Pro / HUD", status: "stable", since: "0.2" },
  { id: 5, component: "DataGrid", category: "Pro / Data", status: "stable", since: "0.2" },
  { id: 6, component: "OpsDashboard", category: "Pro / Template", status: "stable", since: "0.3" },
  { id: 7, component: "GameLobby", category: "Pro / Template", status: "stable", since: "0.3" },
  { id: 8, component: "LandingPage", category: "Pro / Template", status: "stable", since: "0.3" },
];
type DocsRow = typeof DOCS_ROWS[number];

const DOCS_COLUMNS = [
  { key: "component" as const, header: "COMPONENT", sortable: true },
  { key: "category" as const, header: "CATEGORY", sortable: true },
  {
    key: "status" as const,
    header: "STATUS",
    width: 80,
    render: (val: unknown) => (
      <span style={{ color: val === "stable" ? "#00e676" : "#ff6f00", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
        {String(val).toUpperCase()}
      </span>
    ),
  },
  { key: "since" as const, header: "SINCE", width: 60 },
];

function BuyButton({ proUrl }: { proUrl?: string }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (proUrl) {
      window.location.href = proUrl;
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_url: typeof window !== "undefined" ? window.location.href : "" }),
      });
      if (!res.ok) throw new Error("checkout failed");
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="hdux-landing__buy-btn"
      onClick={() => void handleBuy()}
      disabled={loading}
    >
      {loading ? "LOADING…" : "BUY HDUX PRO →"}
    </button>
  );
}

export function LandingPage({
  productName = "HDUX",
  tagline = "THE HUD FRAMEWORK FOR REACT",
  subTagline = "Sci-fi HUD components for dashboards, games, and tools. Free base library — Pro tier unlocks charts, grids, and full-page templates.",
  freeUrl = "https://github.com/hamiltondynamic/hdux",
  proUrl,
  className,
  style,
}: LandingPageProps) {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);
  const [statVal, setStatVal] = useState(0);
  const { history } = useLiveData();

  useEffect(() => {
    const t1 = setTimeout(() => setHeroLoaded(true), 200);
    const t2 = setTimeout(() => setFeaturesLoaded(true), 600);
    const t3 = setTimeout(() => setProLoaded(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const end = 14;
    const step = 40;
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(end, cur + 1);
      setStatVal(cur);
      if (cur >= end) clearInterval(id);
    }, step);
    return () => clearInterval(id);
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
          boxCorners: { length: "16px", width: "2px" },
        },
        light:  { mainColor: "#0a3a5c", background: "#f4f6f8", textColor: "#0a0a0a" },
        dark:   { mainColor: "#00d4ff", background: "#06080f", textColor: "#e0e0e0" },
        custom: { mainColor: "#7b2fff", background: "#08030f", textColor: "#e0d4ff" },
        transitionDuration: "350ms",
      }}
    >
      <div
        className={["hdux-landing", className].filter(Boolean).join(" ")}
        style={style}
      >
        {/* ── Top Navigation ─────────────────────────────────────── */}
        <TopBar>
          <BarLeft>
            <BarElement>
              <Text variant="body">{productName}</Text>
            </BarElement>
          </BarLeft>
          <BarCenter>
            <BarElement borderless>
              <Text variant="body" color="inherit">COMPONENTS</Text>
            </BarElement>
          </BarCenter>
          <BarRight>
            <BarElement borderless>
              <ThemeSelector size={26} />
            </BarElement>
            <BarElement>
              <BuyButton proUrl={proUrl} />
            </BarElement>
          </BarRight>
        </TopBar>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="hdux-landing__hero">
          <div className="hdux-landing__hero-inner">
            <Box animation="standard" hasLoaded={heroLoaded} fullBorder>
              <div className="hdux-landing__hero-box">
                <div className="hdux-landing__hero-label">HAMILTON DYNAMIC</div>
                <div className="hdux-landing__hero-title">{productName}</div>
                <div className="hdux-landing__hero-tagline">{tagline}</div>
                <Text variant="body" animation="sweep">
                  {subTagline}
                </Text>
                <div className="hdux-landing__hero-ctas" style={{ marginTop: "28px" }}>
                  <Button
                    onClick={() => { if (freeUrl) window.open(freeUrl, "_blank"); }}
                  >
                    GET HDUX FREE
                  </Button>
                  <BuyButton proUrl={proUrl} />
                </div>

                <div className="hdux-landing__hero-stats">
                  <div className="hdux-landing__stat">
                    <span className="hdux-landing__stat-value">{statVal}</span>
                    <span className="hdux-landing__stat-label">COMPONENTS</span>
                  </div>
                  <div className="hdux-landing__stat">
                    <span className="hdux-landing__stat-value">TS</span>
                    <span className="hdux-landing__stat-label">TYPESCRIPT</span>
                  </div>
                  <div className="hdux-landing__stat">
                    <span className="hdux-landing__stat-value">MIT</span>
                    <span className="hdux-landing__stat-label">LICENSE</span>
                  </div>
                  <div className="hdux-landing__stat">
                    <span className="hdux-landing__stat-value">R18</span>
                    <span className="hdux-landing__stat-label">REACT 18+</span>
                  </div>
                </div>
              </div>
            </Box>
          </div>
        </section>

        {/* ── Free Components Showcase ────────────────────────────── */}
        <section className="hdux-landing__section">
          <div className="hdux-landing__section-header">
            <span className="hdux-landing__section-title">FREE COMPONENTS</span>
            <div className="hdux-landing__section-divider" />
          </div>

          <div className="hdux-landing__component-grid">
            {/* Box */}
            <Box animation="horizontalFirst" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">BOX</div>
                <div className="hdux-landing__component-demo">
                  <Text variant="body" animation="print">SUBSYSTEM ONLINE</Text>
                  <Text variant="body">CORNER-ANIMATED CONTAINER</Text>
                </div>
              </div>
            </Box>

            {/* Text animations */}
            <Box animation="verticalFirst" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">TEXT</div>
                <div className="hdux-landing__component-demo">
                  <Text variant="h6" animation="print">TYPEWRITER EFFECT</Text>
                  <Text variant="body" animation="sweep">SWEEP REVEAL EFFECT</Text>
                </div>
              </div>
            </Box>

            {/* StatBar */}
            <Box animation="standard" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">STAT BAR</div>
                <div className="hdux-landing__component-demo">
                  <StatBar label="HULL" value={78} showValue="percent" height={6} />
                  <StatBar label="SHIELD" value={45} color="#7b2fff" showValue="percent" height={6} />
                  <StatBar label="POWER" value={92} color="#00e676" showValue="percent" height={6} />
                </div>
              </div>
            </Box>

            {/* RadialMeter */}
            <Box animation="standard" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">RADIAL METER</div>
                <div className="hdux-landing__component-demo" style={{ flexDirection: "row", gap: "12px", alignItems: "center" }}>
                  <RadialMeter value={68} label="CPU" size={72} />
                  <RadialMeter value={82} label="MEM" color="#7b2fff" size={72} />
                </div>
              </div>
            </Box>

            {/* Button */}
            <Box animation="horizontalFirst" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">BUTTON</div>
                <div className="hdux-landing__component-demo" style={{ gap: "8px" }}>
                  <Button>PRIMARY ACTION</Button>
                  <Button color="#7b2fff">SECONDARY</Button>
                </div>
              </div>
            </Box>

            {/* Theme */}
            <Box animation="verticalFirst" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">THEME SELECTOR</div>
                <div className="hdux-landing__component-demo" style={{ alignItems: "center", justifyContent: "center" }}>
                  <ThemeSelector size={48} />
                  <Text variant="body">LIGHT / DARK / CUSTOM</Text>
                </div>
              </div>
            </Box>
          </div>
        </section>

        {/* ── Pro Components Showcase ──────────────────────────────── */}
        <section className="hdux-landing__section">
          <div className="hdux-landing__pro-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="hdux-landing__section-title">HDUX PRO</span>
              <span className="hdux-landing__pro-badge">UNLOCK ALL</span>
            </div>
            <BuyButton proUrl={proUrl} />
          </div>

          {/* Full-width area chart */}
          <Box animation="horizontalFirst" hasLoaded={proLoaded} fullBorder className="hdux-landing__chart-full">
            <AreaChart
              title="LIVE TELEMETRY"
              series={[
                {
                  id: "cpu",
                  label: "CPU %",
                  data: history.cpu.map((v, i) => ({ value: v, label: LIVE_LABELS[i] })),
                  color: "#00d4ff",
                },
                {
                  id: "mem",
                  label: "MEM %",
                  data: history.mem.map((v, i) => ({ value: v, label: LIVE_LABELS[i] })),
                  color: "#7b2fff",
                },
                {
                  id: "net",
                  label: "NET %",
                  data: history.net.map((v, i) => ({ value: v, label: LIVE_LABELS[i] })),
                  color: "#00e676",
                },
              ]}
              width={900}
              height={200}
              showGrid
              animate
            />
          </Box>

          <div className="hdux-landing__pro-grid">
            <Box animation="standard" hasLoaded={proLoaded} fullBorder>
              <GaugeCluster
                title="SYSTEM VITALS"
                gauges={[
                  { label: "CPU",  value: history.gauges[0] },
                  { label: "MEM",  value: history.gauges[1] },
                  { label: "DISK", value: history.gauges[2] },
                  { label: "NET",  value: history.gauges[3] },
                ]}
                columns={2}
                gaugeSize={80}
              />
            </Box>

            <Box animation="verticalFirst" hasLoaded={proLoaded} fullBorder>
              <DataGrid<DocsRow>
                columns={DOCS_COLUMNS}
                rows={DOCS_ROWS}
                pageSize={5}
                searchable
              />
            </Box>
          </div>
        </section>

        {/* ── Templates ────────────────────────────────────────────── */}
        <section className="hdux-landing__section">
          <div className="hdux-landing__section-header">
            <span className="hdux-landing__section-title">PRO TEMPLATES</span>
            <div className="hdux-landing__section-divider" />
          </div>

          <div className="hdux-landing__templates-grid">
            <Box animation="standard" hasLoaded={proLoaded} fullBorder>
              <div className="hdux-landing__template-card">
                <Text variant="h6" animation="print">OPS DASHBOARD</Text>
                <div className="hdux-landing__template-desc">
                  Full-page operational dashboard with live gauge cluster, multi-series area charts, and a searchable event log. Drop-in for monitoring, DevOps, and industrial UIs.
                </div>
                <div className="hdux-landing__template-tags">
                  <span className="hdux-landing__tag">GAUGES</span>
                  <span className="hdux-landing__tag">CHARTS</span>
                  <span className="hdux-landing__tag">EVENT LOG</span>
                </div>
              </div>
            </Box>

            <Box animation="standard" hasLoaded={proLoaded} fullBorder>
              <div className="hdux-landing__template-card">
                <Text variant="h6" animation="print">GAME LOBBY</Text>
                <div className="hdux-landing__template-desc">
                  Competitive multiplayer lobby with team roster, ready states, live countdown, and MMR readout. Plug in your own player data and callbacks.
                </div>
                <div className="hdux-landing__template-tags">
                  <span className="hdux-landing__tag">TEAMS</span>
                  <span className="hdux-landing__tag">COUNTDOWN</span>
                  <span className="hdux-landing__tag">READY STATE</span>
                </div>
              </div>
            </Box>

            <Box animation="standard" hasLoaded={proLoaded} fullBorder>
              <div className="hdux-landing__template-card">
                <Text variant="h6" animation="print">LANDING PAGE</Text>
                <div className="hdux-landing__template-desc">
                  This page. A full marketing site template for HUD-aesthetic products. Hero, component showcase, pricing, and CTA — all wired to the HDUX design system.
                </div>
                <div className="hdux-landing__template-tags">
                  <span className="hdux-landing__tag">HERO</span>
                  <span className="hdux-landing__tag">SHOWCASE</span>
                  <span className="hdux-landing__tag">PRICING</span>
                </div>
              </div>
            </Box>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <section className="hdux-landing__section">
          <div className="hdux-landing__section-header">
            <span className="hdux-landing__section-title">PRICING</span>
            <div className="hdux-landing__section-divider" />
          </div>

          <div className="hdux-landing__pricing-grid">
            {/* Free tier */}
            <Box animation="horizontalFirst" hasLoaded={proLoaded} fullBorder>
              <div className="hdux-landing__pricing-card">
                <div className="hdux-landing__pricing-tier">BASE</div>
                <div className="hdux-landing__pricing-price">
                  FREE <small>MIT LICENSE</small>
                </div>
                <ul className="hdux-landing__pricing-features">
                  {FREE_TIER.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <div className="hdux-landing__pricing-cta">
                  <Button
                    onClick={() => { if (freeUrl) window.open(freeUrl, "_blank"); }}
                  >
                    GET HDUX FREE
                  </Button>
                </div>
              </div>
            </Box>

            {/* Pro tier */}
            <Box animation="horizontalFirst" hasLoaded={proLoaded} fullBorder>
              <div className="hdux-landing__pricing-card">
                <div className="hdux-landing__pricing-tier">PRO</div>
                <div className="hdux-landing__pricing-price">
                  ONE-TIME <small>COMMERCIAL LICENSE</small>
                </div>
                <ul className="hdux-landing__pricing-features">
                  {FREE_TIER.map((f) => <li key={f}>{f}</li>)}
                  {PRO_FEATURES.map((f) => <li key={f} className="pro">{f}</li>)}
                </ul>
                <div className="hdux-landing__pricing-cta">
                  <BuyButton proUrl={proUrl} />
                </div>
              </div>
            </Box>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <BottomBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">HDUX — HAMILTON DYNAMIC</Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            <BarElement>
              <span className="hdux-landing__status-ticker">ALL SYSTEMS OPERATIONAL</span>
            </BarElement>
          </BarRight>
        </BottomBar>
      </div>
    </HduxThemeProvider>
  );
}

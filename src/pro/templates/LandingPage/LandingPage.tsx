import { useEffect, useId, useRef, useState } from "react";
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
import { SupportFunding } from "../../SupportFunding";
import { GaugeCluster } from "../../components/GaugeCluster";
import { DataGrid } from "../../components/DataGrid";
import type { LandingPageProps } from "./types";
import "../templates.css";
import "./LandingPage.css";
import "../responsive.css";

// Only absolute HTTP(S) destinations are accepted, including loopback development services.
function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* Invalid configuration or response. */ }
}

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
      <span style={{ color: val === "stable" ? "var(--hdux-demo-green, #00e676)" : "var(--hdux-demo-orange, #ff6f00)", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
        {String(val).toUpperCase()}
      </span>
    ),
  },
  { key: "since" as const, header: "SINCE", width: 60 },
];

function useCheckout({ proUrl, serviceUrl, onCtaClick }: Pick<LandingPageProps, "proUrl" | "serviceUrl" | "onCtaClick">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pendingRef = useRef(false);
  const destination = safeUrl(proUrl);
  const service = safeUrl(serviceUrl);
  const unavailable = onCtaClick ? "" : proUrl !== undefined
    ? (!destination ? "Checkout unavailable: configure a valid HTTP(S) Pro destination." : "")
    : (!service ? "Checkout unavailable: the app must configure a service URL." : "");

  const handleBuy = async () => {
    if (pendingRef.current || unavailable) return;
    setError("");
    if (destination && !onCtaClick) {
      window.location.assign(destination);
      return;
    }
    pendingRef.current = true;
    setLoading(true);
    try {
      if (onCtaClick) { await onCtaClick(); return; }
      // Reuse the existing Stripe license-service checkout route.
      const res = await fetch(`${service!.replace(/\/$/, "")}/v1/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_url: window.location.href }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`Checkout failed (HTTP ${res.status}). Please retry.`);
      let data: unknown;
      try { data = await res.json(); }
      catch { throw new Error("Checkout returned malformed data. Please retry."); }
      if (!data || typeof data !== "object" || !("url" in data) || !data.url) {
        throw new Error("Checkout returned no destination URL. Please retry.");
      }
      const redirect = safeUrl(data.url);
      if (!redirect) throw new Error("Checkout returned an unsafe or invalid URL. Please retry.");
      window.location.assign(redirect);
    } catch (cause) {
      setError(onCtaClick ? "Unable to start checkout. Please try again." : cause instanceof Error && cause.message.startsWith("Checkout")
        ? cause.message : "Unable to connect to checkout. Please retry.");
    } finally {
      pendingRef.current = false;
      setLoading(false);
    }
  };

  return { loading, error, unavailable, handleBuy };
}

function BuyButton({ checkout, label }: { checkout: ReturnType<typeof useCheckout>; label: string }) {
  const { loading, error, unavailable, handleBuy } = checkout;
  const messageId = useId();

  return (
    <div className="hdux-landing__checkout">
      <button
        className="hdux-landing__buy-btn"
        onClick={() => void handleBuy()}
        disabled={loading || !!unavailable}
        aria-describedby={messageId}
        aria-busy={loading}
      >
        {loading ? "LOADING…" : error ? "RETRY CHECKOUT →" : label}
      </button>
      <span id={messageId} role={error ? "alert" : "status"} className="hdux-landing__checkout-message">
        {error || unavailable}
      </span>
    </div>
  );
}

export function LandingPage({
  productName = "HDUX",
  headline,
  brandName,
  ctaLabel = "BUY HDUX PRO →",
  onCtaClick,
  features,
  stats,
  color = "#00d4ff",
  tagline = "THE HUD FRAMEWORK FOR REACT",
  subTagline = "Sci-fi HUD components for dashboards, games, and tools. Free base library — Pro tier unlocks charts, grids, and full-page templates.",
  freeUrl,
  proUrl,
  serviceUrl,
  className,
  style,
}: LandingPageProps) {
  const checkout = useCheckout({ proUrl, serviceUrl, onCtaClick });
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
          mainColor: color,
          textColor: "#e0e0e0",
          background: "#06080f",
          customColors: { success: "#00e676", failure: "#ff1744", caution: "#ff6f00" },
          typography: { mainFont: '"Quantico", system-ui, monospace' },
          borderWidth: "1px",
          boxCorners: { length: "16px", width: "2px" },
        },
        light:  { mainColor: "#0a3a5c", background: "#f4f6f8", textColor: "#0a0a0a", customColors: { success: "#08783c", caution: "#a04400", failure: "#c91636" } },
        dark:   { mainColor: color, background: "#06080f", textColor: "#e0e0e0" },
        custom: { mainColor: "#ad85ff", background: "#08030f", textColor: "#e0d4ff" },
        transitionDuration: "350ms",
      }}
    >
      <div
        className={["hdux-landing", className].filter(Boolean).join(" ")}
        style={style}
      >
        {/* ── Top Navigation ─────────────────────────────────────── */}
        <TopBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">{brandName ?? productName}</Text>
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
              <BuyButton checkout={checkout} label={ctaLabel} />
            </BarElement>
          </BarRight>
        </TopBar>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="hdux-landing__hero">
          <div className="hdux-landing__hero-inner">
            <Box animation="standard" hasLoaded={heroLoaded} fullBorder>
              <div className="hdux-landing__hero-box">
                <div className="hdux-landing__hero-label">HAMILTON DYNAMIC</div>
                <div className="hdux-landing__hero-title">{headline ?? productName}</div>
                <div className="hdux-landing__hero-tagline">{tagline}</div>
                <Text variant="body" animation="sweep">
                  {subTagline}
                </Text>
                <div className="hdux-landing__hero-ctas" style={{ marginTop: "28px" }}>
                  <Button
                    disabled={!safeUrl(freeUrl)}
                    onClick={() => { const url = safeUrl(freeUrl); if (url) window.open(url, "_blank", "noopener,noreferrer"); }}
                  >
                    GET HDUX FREE
                  </Button>
                  {!safeUrl(freeUrl) && <span role="status">Free download unavailable: configure a valid HTTP(S) destination.</span>}
                  <BuyButton checkout={checkout} label={ctaLabel} />
                </div>

                <div className="hdux-landing__hero-stats">
                  {stats ? stats.map((stat) => (
                    <div className="hdux-landing__stat" key={stat.label}>
                      <span className="hdux-landing__stat-value">{stat.value}</span>
                      <span className="hdux-landing__stat-label">{stat.label}</span>
                    </div>
                  )) : <>
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
                  </>}
                </div>
              </div>
            </Box>
          </div>
        </section>

        {features && (
          <section className="hdux-landing__section hdux-landing__features">
            {features.map((feature) => (
              <Box key={feature.label} animation="standard" hasLoaded={featuresLoaded} fullBorder className="hdux-landing__feature-box">
                <div className="hdux-landing__component-card">
                  {feature.stat && <span className="hdux-landing__tag">{feature.stat}</span>}
                  <Text variant="h5">{feature.label}</Text>
                  <Text variant="body">{feature.description}</Text>
                </div>
              </Box>
            ))}
          </section>
        )}

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
                  <StatBar label="SHIELD" value={45} color="var(--hdux-demo-purple, #7b2fff)" showValue="percent" height={6} />
                  <StatBar label="POWER" value={92} color="var(--hdux-demo-green, #00e676)" showValue="percent" height={6} />
                </div>
              </div>
            </Box>

            {/* RadialMeter */}
            <Box animation="standard" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">RADIAL METER</div>
                <div className="hdux-landing__component-demo" style={{ flexDirection: "row", gap: "12px", alignItems: "center" }}>
                  <RadialMeter value={68} label="CPU" size={72} />
                  <RadialMeter value={82} label="MEM" color="var(--hdux-demo-purple, #7b2fff)" size={72} />
                </div>
              </div>
            </Box>

            {/* Button */}
            <Box animation="horizontalFirst" hasLoaded={featuresLoaded} fullBorder>
              <div className="hdux-landing__component-card">
                <div className="hdux-landing__component-name">BUTTON</div>
                <div className="hdux-landing__component-demo" style={{ gap: "8px" }}>
                  <Button>PRIMARY ACTION</Button>
                  <Button color="var(--hdux-demo-purple, #7b2fff)">SECONDARY</Button>
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
            <BuyButton checkout={checkout} label={ctaLabel} />
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
                  color: "var(--hdux-demo-cyan, #00d4ff)",
                },
                {
                  id: "mem",
                  label: "MEM %",
                  data: history.mem.map((v, i) => ({ value: v, label: LIVE_LABELS[i] })),
                  color: "var(--hdux-demo-purple, #7b2fff)",
                },
                {
                  id: "net",
                  label: "NET %",
                  data: history.net.map((v, i) => ({ value: v, label: LIVE_LABELS[i] })),
                  color: "var(--hdux-demo-green, #00e676)",
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
                    disabled={!safeUrl(freeUrl)}
                    onClick={() => { const url = safeUrl(freeUrl); if (url) window.open(url, "_blank", "noopener,noreferrer"); }}
                  >
                    GET HDUX FREE
                  </Button>
                  {!safeUrl(freeUrl) && <span role="status">Free download unavailable: configure a valid HTTP(S) destination.</span>}
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
                  <BuyButton checkout={checkout} label={ctaLabel} />
                </div>
              </div>
            </Box>
          </div>
        </section>

        <SupportFunding />

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

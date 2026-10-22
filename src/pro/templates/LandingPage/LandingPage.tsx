import { useEffect, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { TopBar, BottomBar, BarLeft, BarCenter, BarRight, BarElement, ThemeSelector } from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { Button } from "../../../components/Button";
import { StatBar } from "../../../components/StatBar";
import { RadialMeter } from "../../../components/RadialMeter";
import { AreaChart } from "../../components/AreaChart";
import { ProGate } from "../../ProGate";
import type { LandingPageProps } from "./types";
import "./LandingPage.css";

const CHECKOUT_ENDPOINT = "https://api.hdux.dev/v1/checkout/session";

const DEFAULT_FEATURES = [
  {
    label: "REALTIME DASHBOARDS",
    description: "Live data visualization with animated charts, gauges, and event logs. Built for ops, analytics, and monitoring interfaces.",
    stat: "3 PRO WIDGETS",
  },
  {
    label: "GAME INTERFACES",
    description: "Pre-built lobby, team view, ready state, and countdown flows. Drop in and customize for your multiplayer title.",
    stat: "LOBBY + HUD READY",
  },
  {
    label: "HUD COMPONENTS",
    description: "RadialMeter, StatBar, GaugeCluster — the building blocks of sci-fi UIs, battle-tested and animation-ready.",
    stat: "10+ COMPONENTS",
  },
];

const DEFAULT_STATS = [
  { label: "COMPONENTS", value: "10+" },
  { label: "PRO WIDGETS", value: "3" },
  { label: "FULL-PAGE TEMPLATES", value: "3" },
  { label: "PEER DEPS", value: "1" },
];

// Sparkline data cycling for the live area chart demo
const SPARK_FRAMES = [
  [18, 35, 52, 44, 68, 55, 72, 60, 80, 68],
  [35, 52, 44, 68, 55, 72, 60, 80, 68, 74],
  [52, 44, 68, 55, 72, 60, 80, 68, 74, 62],
  [44, 68, 55, 72, 60, 80, 68, 74, 62, 70],
];

function LandingPageInner({
  headline = "HAMILTON DYNAMIC UX",
  tagline = "The sci-fi design system for React. Open-core base, Pro for the good stuff.",
  brandName = "HDUX",
  ctaLabel = "GET HDUX PRO →",
  onCtaClick,
  features = DEFAULT_FEATURES,
  stats = DEFAULT_STATS,
  color = "#00d4ff",
  className,
  style,
}: LandingPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [gaugeValues, setGaugeValues] = useState([68, 82, 44, 91]);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(id);
  }, []);

  // Cycle sparkline frames
  useEffect(() => {
    const id = setInterval(() => setFrameIdx((i) => (i + 1) % SPARK_FRAMES.length), 1800);
    return () => clearInterval(id);
  }, []);

  // Drift gauge values
  useEffect(() => {
    const id = setInterval(() => {
      setGaugeValues((prev) =>
        prev.map((v) => Math.min(99, Math.max(5, v + (Math.random() - 0.5) * 8)))
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const sparkData = SPARK_FRAMES[frameIdx].map((v, i) => ({ value: v, label: String(i) }));

  async function handleCta() {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    try {
      const here = typeof window !== "undefined" ? window.location.href : "";
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_url: here }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url && typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch {
      // swallow
    }
  }

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
          boxCorners: { length: "14px", width: "2px" },
        },
        dark: { mainColor: color, textColor: "#e0e0e0", background: "#06080f" },
        light: { mainColor: "#0050a0", textColor: "#111", background: "#f5f7fa" },
      }}
    >
      <div
        className={["hdux-landing", className].filter(Boolean).join(" ")}
        style={style}
      >
        {/* Background grid */}
        <div className="hdux-landing__grid-bg" aria-hidden="true" />

        <TopBar>
          <BarLeft>
            <BarElement>
              <span className="hdux-landing__brand">{brandName}</span>
            </BarElement>
          </BarLeft>
          <BarCenter>
            <BarElement borderless>
              <Text variant="body" style={{ opacity: 0.5, fontSize: "0.65rem" }}>
                HAMILTON DYNAMIC · OPEN CORE
              </Text>
            </BarElement>
          </BarCenter>
          <BarRight>
            <BarElement borderless>
              <ThemeSelector size={28} />
            </BarElement>
          </BarRight>
        </TopBar>

        <div className="hdux-landing__body">

          {/* ── Hero ─────────────────────────────────────────── */}
          <section className="hdux-landing__hero">
            <Box animation="standard" hasLoaded={loaded} fullBorder className="hdux-landing__hero-box">
              <div className="hdux-landing__hero-inner">
                <div className="hdux-landing__hero-badge">[ OPEN SOURCE + PRO ]</div>
                <Text variant="h1" animation="print" className="hdux-landing__headline">
                  {headline}
                </Text>
                <Text variant="subheading" animation="sweep" className="hdux-landing__tagline">
                  {tagline}
                </Text>

                {/* Live mini-demo strip */}
                <div className="hdux-landing__hero-demo">
                  <div className="hdux-landing__demo-chart">
                    <AreaChart
                      data={sparkData}
                      color={color}
                      width={220}
                      height={80}
                      showGrid={false}
                      showXLabels={false}
                      showYLabels={false}
                      animate
                      title="LIVE THROUGHPUT"
                    />
                  </div>
                  <div className="hdux-landing__demo-gauges">
                    <RadialMeter value={Math.round(gaugeValues[0])} label="CPU" size={72} />
                    <RadialMeter value={Math.round(gaugeValues[1])} label="MEM" size={72} />
                    <RadialMeter value={Math.round(gaugeValues[2])} label="DISK" size={72} />
                  </div>
                </div>

                <div className="hdux-landing__hero-cta">
                  <Button onClick={() => void handleCta()} color={color}>
                    {ctaLabel}
                  </Button>
                  <span className="hdux-landing__hero-sub">One-time license · Unlimited projects</span>
                </div>
              </div>
            </Box>
          </section>

          {/* ── Stats strip ──────────────────────────────────── */}
          <section className="hdux-landing__stats">
            {stats.map((s) => (
              <div key={s.label} className="hdux-landing__stat">
                <span className="hdux-landing__stat-value" style={{ color }}>{s.value}</span>
                <span className="hdux-landing__stat-label">{s.label}</span>
              </div>
            ))}
          </section>

          {/* ── Feature grid ─────────────────────────────────── */}
          <section className="hdux-landing__features">
            {features.map((f, i) => (
              <Box
                key={i}
                animation={i === 0 ? "verticalFirst" : i === 1 ? "standard" : "horizontalFirst"}
                hasLoaded={loaded}
                fullBorder
                className="hdux-landing__feature-box"
              >
                <div className="hdux-landing__feature">
                  {f.stat && (
                    <span className="hdux-landing__feature-badge" style={{ color }}>{f.stat}</span>
                  )}
                  <Text variant="h5" animation="print">{f.label}</Text>
                  <Text variant="body" className="hdux-landing__feature-desc">{f.description}</Text>
                  {i === 0 && (
                    <div className="hdux-landing__feature-demo">
                      <StatBar label="THROUGHPUT" value={Math.round(gaugeValues[3])} color={color} showValue="percent" height={6} />
                      <StatBar label="LATENCY" value={Math.round(gaugeValues[0] * 0.6)} color="#7b2fff" showValue="percent" height={6} />
                    </div>
                  )}
                  {i === 1 && (
                    <div className="hdux-landing__feature-demo">
                      <div className="hdux-landing__player-row">
                        <span className="hdux-landing__dot" style={{ background: "#00e676" }} />
                        <span className="hdux-landing__player-name" style={{ color }}>ACE_PILOT</span>
                        <span className="hdux-landing__player-stat">2841 MMR</span>
                        <span style={{ color: "#00e676", fontSize: "0.65rem" }}>READY</span>
                      </div>
                      <div className="hdux-landing__player-row">
                        <span className="hdux-landing__dot" style={{ background: "#ff1744" }} />
                        <span className="hdux-landing__player-name" style={{ color }}>GHOST_0x7F</span>
                        <span className="hdux-landing__player-stat">2790 MMR</span>
                        <span style={{ color: "#ff1744", fontSize: "0.65rem" }}>WAITING</span>
                      </div>
                      <div className="hdux-landing__player-row">
                        <span className="hdux-landing__dot" style={{ background: "#ff6f00" }} />
                        <span className="hdux-landing__player-name" style={{ color }}>UNIT_NULL</span>
                        <span className="hdux-landing__player-stat">2650 MMR</span>
                        <span style={{ color: "#ff6f00", fontSize: "0.65rem" }}>LOADING</span>
                      </div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="hdux-landing__feature-demo hdux-landing__feature-demo--gauges">
                      <RadialMeter value={Math.round(gaugeValues[0])} label="POWER" size={68} />
                      <RadialMeter value={Math.round(gaugeValues[1])} label="SHIELD" size={68} color="#7b2fff" />
                    </div>
                  )}
                </div>
              </Box>
            ))}
          </section>

          {/* ── Pro CTA ──────────────────────────────────────── */}
          <section className="hdux-landing__cta-section">
            <Box animation="horizontalFirst" hasLoaded={loaded} fullBorder className="hdux-landing__cta-box">
              <div className="hdux-landing__cta-inner">
                <div className="hdux-landing__cta-left">
                  <Text variant="h3" animation="print">HDUX PRO</Text>
                  <Text variant="body" className="hdux-landing__cta-desc">
                    Advanced data-viz HUD widgets, full-page dashboard &amp; game-UI templates,
                    and priority updates — one license, unlimited projects.
                  </Text>
                  <ul className="hdux-landing__cta-list">
                    {["AreaChart (multi-series)", "DataGrid (sort/filter/page)", "GaugeCluster", "OpsDashboard template", "GameLobby template", "LandingPage template"].map((item) => (
                      <li key={item} className="hdux-landing__cta-item">
                        <span className="hdux-landing__cta-tick" style={{ color }}>▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="hdux-landing__cta-right">
                  <div className="hdux-landing__price-badge" style={{ borderColor: color }}>
                    <span className="hdux-landing__price-label">ONE-TIME</span>
                    <span className="hdux-landing__price-value" style={{ color }}>PRO LICENSE</span>
                    <span className="hdux-landing__price-note">Unlimited projects</span>
                  </div>
                  <Button onClick={() => void handleCta()} color={color}>
                    {ctaLabel}
                  </Button>
                </div>
              </div>
            </Box>
          </section>

        </div>

        <BottomBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">{brandName} · OPEN CORE</Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            <BarElement>
              <Text variant="body">MIT LICENSE</Text>
            </BarElement>
          </BarRight>
        </BottomBar>
      </div>
    </HduxThemeProvider>
  );
}

export function LandingPage(props: LandingPageProps) {
  return (
    <ProGate componentName="LandingPage">
      <LandingPageInner {...props} />
    </ProGate>
  );
}

import { useTheme } from "../../../theme/useTheme";
import { RadialMeter } from "../../../components/RadialMeter";
import { StatBar } from "../../../components/StatBar";
import { ProGate } from "../../ProGate";
import type { GaugeClusterProps } from "./types";
import "./GaugeCluster.css";

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function GaugeClusterInner({
  gauges,
  columns,
  gaugeSize = 100,
  title,
  healthAggregation = "avg",
  className,
  style,
}: GaugeClusterProps) {
  const { theme } = useTheme();

  const cols = columns ?? Math.min(4, gauges.length);

  const percentages = gauges.map((g) => {
    const min = g.min ?? 0;
    const max = g.max ?? 100;
    return clamp01((g.value - min) / (max - min));
  });

  let healthPct = 0;
  if (healthAggregation === "avg") {
    healthPct = percentages.reduce((a, b) => a + b, 0) / (percentages.length || 1);
  } else if (healthAggregation === "min") {
    healthPct = Math.min(...percentages);
  }

  const healthValue = Math.round(healthPct * 100);
  const healthColor =
    healthValue >= 75
      ? (theme.customColors?.success ?? "#00e676")
      : healthValue >= 40
        ? (theme.customColors?.caution ?? "#ff6f00")
        : (theme.customColors?.failure ?? "#ff1744");

  return (
    <div
      className={["hdux-gauge-cluster", className].filter(Boolean).join(" ")}
      style={style}
    >
      {title && (
        <div className="hdux-gauge-cluster__title" style={{ color: theme.mainColor }}>
          {title}
        </div>
      )}

      <div
        className="hdux-gauge-cluster__grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {gauges.map((g, i) => (
          <div key={i} className="hdux-gauge-cluster__item">
            <RadialMeter
              value={g.value}
              min={g.min}
              max={g.max}
              label={g.label}
              color={g.color ?? theme.mainColor}
              size={gaugeSize}
              formatValue={g.formatValue}
            />
          </div>
        ))}
      </div>

      {healthAggregation !== false && (
        <div className="hdux-gauge-cluster__health">
          <StatBar
            label="CLUSTER HEALTH"
            value={healthValue}
            max={100}
            color={healthColor}
            showValue="percent"
            height={6}
          />
        </div>
      )}
    </div>
  );
}

export function GaugeCluster(props: GaugeClusterProps) {
  return (
    <ProGate componentName="GaugeCluster">
      <GaugeClusterInner {...props} />
    </ProGate>
  );
}

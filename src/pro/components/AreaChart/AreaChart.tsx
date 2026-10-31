import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "../../../theme/useTheme";
import { ProGate } from "../../ProGate";
import type { AreaChartProps, AreaChartSeries } from "./types";
import "./AreaChart.css";

const PAD = { top: 24, right: 16, bottom: 36, left: 48 };
const GRID_LINES = 4;

function normalizeSeries(props: AreaChartProps): AreaChartSeries[] {
  if (props.series) return props.series;
  const rawData = props.data ?? [];
  const points = rawData.map((d, i) =>
    typeof d === "number"
      ? { value: d, label: String(i) }
      : { ...d, label: d.label ?? String(i) }
  );
  return [{ id: "default", label: props.label, data: points, color: props.color }];
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

function AreaChartInner({
  width = 480,
  height = 200,
  showGrid = true,
  showXLabels = true,
  showYLabels = true,
  animate = true,
  showDots = true,
  title,
  loading = false,
  loadingMessage = "LOADING…",
  emptyMessage = "NO DATA",
  insufficientDataMessage = "NOT ENOUGH DATA",
  className,
  style,
  ...rest
}: AreaChartProps) {
  const { theme } = useTheme();
  const seriesList = normalizeSeries(rest);
  const chartId = useId();
  const hasData = seriesList.some((s) => s.data.length > 0);
  const hasPlot = seriesList.some((s) => s.data.length > 1);
  const status = loading ? loadingMessage : !hasData ? emptyMessage : !hasPlot ? insufficientDataMessage : "";
  const showPlot = !loading && hasPlot;
  const pathRefs = useRef<SVGPathElement[]>([]);
  const [drawn, setDrawn] = useState(!animate);

  const chartW = width - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const allValues = seriesList.flatMap((s) => s.data.map((d) => d.value));
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues, 1);
  const range = maxVal - minVal || 1;

  const toX = (i: number, total: number) =>
    total > 1 ? (i / (total - 1)) * chartW : chartW / 2;
  const toY = (v: number) => chartH - ((v - minVal) / range) * chartH;

  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
    minVal + (range * i) / GRID_LINES
  );

  const xLabels = seriesList.find((s) => s.data.length > 1)?.data.map((d) => d.label ?? "");

  useEffect(() => {
    if (!animate) return;
    setDrawn(false);
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [animate, seriesList.map((s) => s.data.map((d) => d.value).join(",")).join("|")]);

  return (
    <div
      className={["hdux-area-chart", className].filter(Boolean).join(" ")}
      style={{ width, ...style } as React.CSSProperties}
    >
      {title && (
        <div className="hdux-area-chart__title" style={{ color: theme.mainColor }}>
          {title}
        </div>
      )}
      <div
        role="status"
        aria-live="polite"
        className={showPlot ? "hdux-area-chart__sr-only" : "hdux-area-chart__status"}
        style={showPlot ? undefined : { height, color: theme.mainColor }}
      >
        {status}
      </div>
      {showPlot && <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="hdux-area-chart__svg"
        role="img"
        aria-label={`${title ?? "Area chart"}. Values are available in the following data table.`}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid */}
          {showGrid &&
            gridValues.map((v, i) => {
              const y = toY(v);
              return (
                <line
                  key={i}
                  x1={0}
                  y1={y}
                  x2={chartW}
                  y2={y}
                  stroke={theme.mainColor}
                  strokeOpacity={0.1}
                  strokeWidth={1}
                />
              );
            })}

          {/* Y labels */}
          {showYLabels &&
            gridValues.map((v, i) => (
              <text
                key={i}
                x={-8}
                y={toY(v)}
                textAnchor="end"
                dominantBaseline="middle"
                className="hdux-area-chart__axis-label"
                fill={theme.mainColor}
                fillOpacity={0.5}
                fontSize={9}
              >
                {Math.round(v)}
              </text>
            ))}

          {/* X labels */}
          {showXLabels &&
            xLabels?.map((lbl, i) => {
              const n = xLabels.length;
              if (n > 12 && i % Math.ceil(n / 8) !== 0) return null;
              return (
                <text
                  key={i}
                  x={toX(i, n)}
                  y={chartH + 16}
                  textAnchor="middle"
                  className="hdux-area-chart__axis-label"
                  fill={theme.mainColor}
                  fillOpacity={0.5}
                  fontSize={9}
                >
                  {lbl}
                </text>
              );
            })}

          {/* Series */}
          {seriesList.map((s, si) => {
            if (s.data.length === 0) return null;
            const color = s.color ?? theme.mainColor;
            const n = s.data.length;
            const pts = s.data.map((d, i) => ({ x: toX(i, n), y: toY(d.value) }));
            const linePath = smoothPath(pts);
            const areaPath = n > 1 ?
              linePath +
              ` L ${pts[pts.length - 1].x},${chartH} L ${pts[0].x},${chartH} Z` : "";
            const pathId = `hdux-area-clip-${chartId}-${si}`;

            return (
              <g key={s.id}>
                <defs>
                  <linearGradient id={`${pathId}-grad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                {drawn && n > 1 && (
                  <path
                    d={areaPath}
                    fill={`url(#${pathId}-grad)`}
                    className="hdux-area-chart__area"
                  />
                )}

                {/* Line */}
                {n > 1 && <path
                  ref={(el) => {
                    if (el) pathRefs.current[si] = el;
                  }}
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  className={
                    animate
                      ? `hdux-area-chart__line ${drawn ? "hdux-area-chart__line--drawn" : ""}`
                      : "hdux-area-chart__line hdux-area-chart__line--static"
                  }
                />}

                {/* Dots */}
                {(showDots || n === 1) &&
                  drawn &&
                  pts.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={2.5}
                      fill={color}
                      className="hdux-area-chart__dot"
                    />
                  ))}
              </g>
            );
          })}
        </g>
      </svg>}
      {!loading && hasData && (
        <table className="hdux-area-chart__sr-only">
          <caption>{title ?? "Area chart"} — data</caption>
          <thead>
            <tr><th scope="col">Series</th><th scope="col">Point</th><th scope="col">Value</th></tr>
          </thead>
          <tbody>
            {seriesList.flatMap((series) => series.data.map((point, index) => (
              <tr key={`${series.id}-${index}`}>
                <th scope="row">{series.label ?? series.id}</th>
                <td>{point.label ?? String(index)}</td>
                <td>{point.value}</td>
              </tr>
            )))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function AreaChart(props: AreaChartProps) {
  return (
    <ProGate componentName="AreaChart">
      <AreaChartInner {...props} />
    </ProGate>
  );
}

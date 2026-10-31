import type { AreaChartSeries } from "./types";

/** Local fixtures for stories and browser regression tests; not package exports. */
export const mixedSeries: AreaChartSeries[] = [
  { id: "empty", label: "Pending", data: [] },
  { id: "cpu", label: "CPU", data: [{ label: "09:00", value: -2.5 }, { label: "10:00", value: 12 }] },
  { id: "mem", label: "Memory", data: [{ label: "09:30", value: 7 }] },
];

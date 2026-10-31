import React, { act } from 'react';
import { afterEach, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { HduxProContext } from '../src/pro/ProContext';
import { HduxThemeProvider } from '../src/theme/ThemeProvider';
import { AreaChart } from '../src/pro/components/AreaChart/AreaChart';
import type { AreaChartProps } from '../src/pro/components/AreaChart/types';
import { mixedSeries } from '../src/pro/components/AreaChart/AreaChart.fixtures';

let root: Root;
let host: HTMLDivElement;
function render(props: AreaChartProps) {
  if (!host) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  act(() => root.render(
    <HduxProContext.Provider value={{ status: 'valid', licenseKey: undefined }}>
      <HduxThemeProvider><AreaChart animate={false} {...props} /></HduxThemeProvider>
    </HduxProContext.Provider>
  ));
}
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  host = undefined!;
});

for (const props of [{}, { data: [] }, { series: [] }, { series: [{ id: 'empty', data: [] }] }]) {
  it(`renders empty feedback without SVG for ${JSON.stringify(props)}`, () => {
    render(props);
    expect(host.querySelector('[role="status"]')?.textContent).toBe('NO DATA');
    expect(host.querySelector('svg')).toBeNull();
    expect(host.querySelector('table')).toBeNull();
  });
}

it('replaces stale values during loading and announces state transitions with custom messages', () => {
  render({ loading: true, data: [1, 2], loadingMessage: 'Fetching samples' });
  const status = host.querySelector('[role="status"]')!;
  expect(status.textContent).toBe('Fetching samples');
  expect(status.getAttribute('aria-live')).toBe('polite');
  expect(host.querySelector('svg, table')).toBeNull();
  render({ data: [], emptyMessage: 'No samples' });
  expect(host.querySelector('[role="status"]')).toBe(status);
  expect(status.textContent).toBe('No samples');
  render({ data: [0], insufficientDataMessage: 'Waiting for another sample' });
  expect(status.textContent).toBe('Waiting for another sample');
  expect(host.querySelector('svg')).toBeNull();
  expect(host.querySelector('tbody')?.textContent).toContain('0');
  render({ data: [0, 2] });
  expect(status.textContent).toBe('');
  expect(host.querySelector('svg')).not.toBeNull();
});

it('keeps single-point values accessible and avoids a degenerate plot even with dots disabled', () => {
  render({ data: [{ label: 'Noon', value: 3.75 }], label: 'CPU', showDots: false });
  expect(host.querySelector('[role="status"]')?.textContent).toBe('NOT ENOUGH DATA');
  expect(host.querySelector('svg')).toBeNull();
  expect(Array.from(host.querySelectorAll('tbody tr > *'), cell => cell.textContent)).toEqual(['CPU', 'Noon', '3.75']);
});

it('plots mixed series safely and exposes all exact values with series and point labels', () => {
  render({ series: mixedSeries, title: 'Telemetry', showDots: false });
  expect(host.querySelector('caption')?.textContent).toBe('Telemetry — data');
  expect(Array.from(host.querySelectorAll('tbody tr'), row => Array.from(row.children, cell => cell.textContent))).toEqual([
    ['CPU', '09:00', '-2.5'], ['CPU', '10:00', '12'], ['Memory', '09:30', '7'],
  ]);
  expect(host.querySelectorAll('th[scope="col"]')).toHaveLength(3);
  expect(host.querySelectorAll('circle')).toHaveLength(1);
  const paths = host.querySelectorAll('path');
  expect(paths).toHaveLength(2);
  for (const path of paths) {
    expect(path.getAttribute('d')).toMatch(/^M /);
    expect(path.getAttribute('d')).not.toMatch(/NaN|undefined|Infinity/);
  }
  expect(host.querySelector('svg')?.textContent).toContain('10:00');
  const table = host.querySelector('table')!;
  expect(table.closest('[aria-hidden="true"]')).toBeNull();
  expect(getComputedStyle(table).display).not.toBe('none');
  expect(getComputedStyle(table).visibility).toBe('visible');
});

it('provides fallback series and point labels for shorthand numeric values', () => {
  render({ data: [0, -1.25] });
  expect(host.querySelector('caption')?.textContent).toBe('Area chart — data');
  expect(Array.from(host.querySelectorAll('tbody tr'), row => Array.from(row.children, cell => cell.textContent))).toEqual([
    ['default', '0', '0'], ['default', '1', '-1.25'],
  ]);
});

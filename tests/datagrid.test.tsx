import React, { act } from 'react';
import { afterEach, expect, it } from 'vitest';
import { commands, userEvent } from 'vitest/browser';
import { createRoot, type Root } from 'react-dom/client';
import { composeStories } from '@storybook/react-vite';
import { HduxProContext } from '../src/pro/ProContext';
import { HduxThemeProvider } from '../src/theme/ThemeProvider';
import { DataGrid } from '../src/pro/components/DataGrid/DataGrid';
import * as stories from '../src/pro/components/DataGrid/DataGrid.stories';

declare module 'vitest/browser' {
  interface BrowserCommands {
    setReducedMotion(preference: 'reduce' | 'no-preference'): Promise<void>;
  }
}
let root: Root;
let host: HTMLDivElement;
function render(element: React.ReactNode) {
  if (!host) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  act(() => root.render(<HduxProContext.Provider value={{ status: 'valid', licenseKey: undefined }}><HduxThemeProvider>{element}</HduxThemeProvider></HduxProContext.Provider>));
}
afterEach(async () => {
  act(() => root?.unmount());
  host?.remove();
  host = undefined!;
  await commands.setReducedMotion('no-preference');
});
const columns = [{ key: 'name', header: 'Name' }];
const rows = Array.from({ length: 24 }, (_, i) => ({ name: `MATCH-${i + 1}` }));

it('respects initial reduced motion and live preference changes', async () => {
  await commands.setReducedMotion('reduce');
  render(<DataGrid columns={columns} rows={[]} loading />);
  const cell = host.querySelector('.hdux-datagrid__loading')!;
  const reduced = async () => {
    await expect.poll(() => getComputedStyle(cell).animationName).toBe('none');
    expect(getComputedStyle(cell).opacity).toBe('1');
    expect(cell.textContent).toBe('LOADING…');
  };
  await reduced();
  await commands.setReducedMotion('no-preference');
  await expect.poll(() => getComputedStyle(cell).animationName).toBe('hdux-datagrid-pulse');
  await commands.setReducedMotion('reduce');
  await reduced();
});

for (const outcome of ['populated', 'empty', 'error'] as const) {
  it(`preserves retry focus through loading → ${outcome}, without refocusing on completion`, async () => {
    const { RetryLifecycle } = composeStories(stories);
    render(<RetryLifecycle />);
    const retry = host.querySelector<HTMLButtonElement>('.hdux-datagrid__retry-btn')!;
    retry.focus();
    await userEvent.keyboard('{Enter}');
    const grid = host.querySelector('[role="grid"]')!;
    expect(grid.getAttribute('aria-label')).toBe('Data grid');
    expect(document.activeElement).toBe(grid);
    expect(host.querySelector('[role="status"]')?.textContent).toBe('LOADING…');
    const label = { populated: 'Complete with rows', empty: 'Complete empty', error: 'Complete with error' }[outcome];
    const complete = Array.from(host.querySelectorAll('button')).find(b => b.textContent === label)!;
    // Programmatic completion models a response arriving while focus stays on the grid.
    act(() => complete.click());
    expect(document.activeElement).toBe(grid);
    expect(host.textContent).toContain({ populated: 'UNIT-001', empty: 'NO DATA', error: 'ERROR LOADING DATA' }[outcome]);
    // Repeat, but move focus during the fetch: completion must leave it there.
    act(() => Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Reset error')!.click());
    host.querySelector<HTMLButtonElement>('.hdux-datagrid__retry-btn')!.focus();
    await userEvent.keyboard('{Enter}');
    complete.focus();
    act(() => complete.click());
    expect(document.activeElement).toBe(complete);
  });
}

it('does not steal focus when an external control removes retry', async () => {
  const { RetryLifecycle } = composeStories(stories);
  render(<RetryLifecycle />);
  const external = Array.from(host.querySelectorAll('button')).find(b => b.textContent === 'Start external refresh')!;
  external.focus();
  await userEvent.keyboard('{Enter}');
  expect(document.activeElement).toBe(external);
  expect(host.querySelector('.hdux-datagrid__retry-btn')).toBeNull();
});

it('clamps before slicing after rows/pageSize change and paginates from the clamped page', () => {
  const draw = (data = rows, pageSize = 4) => render(<DataGrid columns={columns} rows={data} pageSize={pageSize} defaultQuery="MATCH" />);
  const next = () => act(() => host.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click());
  draw();
  for (let i = 0; i < 5; i++) next();
  expect(host.textContent).toContain('MATCH-24');
  draw(rows.slice(0, 10));
  expect(host.textContent).toContain('MATCH-9');
  expect(host.textContent).not.toContain('NO RESULTS');
  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
  act(() => host.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')!.click());
  expect(host.textContent).toContain('MATCH-5');
  draw(rows, 12);
  expect(host.textContent).toContain('MATCH-13');
  draw(rows, 30);
  expect(host.textContent).toContain('MATCH-1');
  expect(host.textContent).not.toContain('NO RESULTS');
  draw([{ name: 'OTHER' }]);
  expect(host.querySelector('[role="status"]')?.textContent).toBe('NO RESULTS');
  draw([]);
  expect(host.querySelector('[role="status"]')?.textContent).toBe('NO DATA');
});

import React, { act, useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { createRoot, type Root } from 'react-dom/client';
import { HduxThemeProvider } from '../src/theme/ThemeProvider';
import { Table } from '../src/components/Table/Table';

let root: Root;
let host: HTMLDivElement;
const columns = [{ key: 'name' as const, header: 'Name' }];
const rows = [{ name: 'Alpha' }, { name: 'Beta' }];

function render(element: React.ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<HduxThemeProvider>{element}</HduxThemeProvider>));
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
});

it('tabs through rows in both directions and opens details with Enter and Space', async () => {
  const activate = vi.fn();
  function MasterDetail() {
    const [detail, setDetail] = useState('None');
    return <>
      <Table columns={columns} rows={rows} color="#00ff88" onRowClick={(row, index) => {
        activate(row, index);
        setDetail(row.name);
      }} />
      <output aria-label="Details">{detail}</output>
      <button>After table</button>
    </>;
  }
  render(<MasterDetail />);
  const tableRows = host.querySelectorAll('tbody tr');
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(tableRows[0]);
  expect(tableRows[0].matches(':focus-visible')).toBe(true);
  const focusStyle = getComputedStyle(tableRows[0]);
  expect(focusStyle.outlineStyle).toBe('solid');
  expect(focusStyle.outlineWidth).toBe('2px');
  expect(focusStyle.outlineColor).toBe('rgb(0, 255, 136)');
  // Keep native table, row, and cell roles for assistive table navigation.
  await expect.element(page.getByRole('row', { name: 'Alpha', exact: true })).toBeVisible();
  await expect.element(page.getByRole('cell', { name: 'Alpha', exact: true })).toBeVisible();
  expect(tableRows[0].getAttribute('aria-description')).toBe('Press Enter or Space to activate this row.');
  expect(tableRows[0].getAttribute('aria-keyshortcuts')).toBe('Enter Space');
  await userEvent.keyboard('{Enter}');
  expect(activate).toHaveBeenNthCalledWith(1, rows[0], 0);
  expect(host.querySelector('output')?.textContent).toBe('Alpha');
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(tableRows[1]);
  await userEvent.keyboard(' ');
  expect(activate).toHaveBeenNthCalledWith(2, rows[1], 1);
  expect(activate).toHaveBeenCalledTimes(2);
  expect(host.querySelector('output')?.textContent).toBe('Beta');
  expect(document.activeElement).toBe(tableRows[1]);
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(host.querySelector('button'));
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  expect(document.activeElement).toBe(tableRows[1]);
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  expect(document.activeElement).toBe(tableRows[0]);
});

it('prevents Space scrolling, ignores other keys and held-key repeats', async () => {
  const activate = vi.fn();
  render(<Table columns={columns} rows={rows} onRowClick={activate} />);
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{ArrowDown}{Escape}a');
  expect(activate).not.toHaveBeenCalled();
  const row = host.querySelector('tbody tr')!;
  for (const key of ['Enter', ' ']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    act(() => row.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    const repeat = new KeyboardEvent('keydown', { key, repeat: true, bubbles: true, cancelable: true });
    act(() => row.dispatchEvent(repeat));
    expect(repeat.defaultPrevented).toBe(true);
  }
  expect(activate).toHaveBeenCalledTimes(2);
});

it('leaves keyboard events from cell controls to those controls', async () => {
  const activate = vi.fn();
  const control = vi.fn();
  render(<Table columns={[{ key: 'name', header: 'Name', render: () => <>
    <input aria-label="Edit name" />
    <button onClick={(event) => { event.stopPropagation(); control(); }}>Cell action</button>
  </> }]} rows={[rows[0]]} onRowClick={activate} />);
  await userEvent.keyboard('{Tab}{Tab}');
  expect(document.activeElement).toBe(host.querySelector('input'));
  await userEvent.keyboard('a b{Enter}');
  expect(host.querySelector('input')?.value).toBe('a b');
  await userEvent.keyboard('{Tab}{Enter} ');
  expect(control).toHaveBeenCalledTimes(2);
  expect(activate).not.toHaveBeenCalled();
});

it('keeps static and empty tables out of the tab order with no activation hints', async () => {
  render(<>
    <Table columns={columns} rows={rows} />
    <Table columns={columns} rows={[]} onRowClick={vi.fn()} />
    <button>After tables</button>
  </>);
  for (const row of host.querySelectorAll('tr')) {
    expect(row.hasAttribute('tabindex')).toBe(false);
    expect(row.hasAttribute('aria-description')).toBe(false);
    expect(row.hasAttribute('aria-keyshortcuts')).toBe(false);
  }
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(host.querySelector('button'));
});

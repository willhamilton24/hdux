import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { validateLicense } from '../src/pro/validateLicense';
import { HduxProProvider } from '../src/pro/ProProvider';
import { OpsDashboard } from '../src/pro/templates/OpsDashboard/OpsDashboard';
import { GameLobby } from '../src/pro/templates/GameLobby/GameLobby';
import { LandingPage } from '../src/pro/templates/LandingPage/LandingPage';
import { PRO_KEY, VALIDATION_URL, mockProValidation } from '../.storybook/proFixture';

let host: HTMLDivElement;
let root: Root;
let restore: () => void;
beforeEach(() => {
  document.body.style.margin = '0';
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  restore = mockProValidation();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  restore();
  vi.restoreAllMocks();
});
async function render(child: React.ReactNode) {
  await act(async () => root.render(
    <HduxProProvider licenseKey={PRO_KEY} validationUrl={VALIDATION_URL}>{child}</HduxProProvider>
  ));
  await vi.waitFor(() => expect(host.querySelector('.hdux-pro-gate')).toBeNull());
}

test('dashboard preserves values over time and rerenders all supplied series counts', async () => {
  const series = Array.from({ length: 4 }, (_, i) => ({ label: `Series ${i}`, data: [0, i + 10] }));
  await render(<OpsDashboard metrics={[{ label: 'EXACT', value: 0 }]} chartSeries={series} />);
  expect(host.querySelectorAll('.hdux-area-chart')).toHaveLength(4);
  const chart = host.querySelector('.hdux-area-chart__line')?.getAttribute('d');
  expect(chart).toBeTruthy();
  const gauge = host.querySelector('.hdux-gauge-cluster')?.textContent;
  await new Promise(resolve => setTimeout(resolve, 2300));
  expect(host.querySelector('.hdux-area-chart__line')?.getAttribute('d')).toBe(chart);
  expect(host.querySelector('.hdux-gauge-cluster')?.textContent).toBe(gauge);
  expect(host.textContent).toContain('NO SERVICE DATA');
  await render(<OpsDashboard metrics={[{ label: 'UPDATED', value: 37 }]} chartSeries={[{ label: 'New series', data: [80, 90] }]} serviceNodes={[{ name: 'real-service', status: 'warn' }]} />);
  expect(host.textContent).toContain('UPDATED');
  expect(host.textContent).toContain('37');
  expect(host.textContent).not.toContain('EXACT');
  expect(host.querySelectorAll('.hdux-area-chart')).toHaveLength(1);
  expect(host.querySelector('.hdux-area-chart__line')?.getAttribute('d')).not.toBe(chart);
  expect(host.textContent).toContain('1 WARN');
  await render(<OpsDashboard metrics={[]} chartSeries={[]} serviceNodes={[]} demoMode />);
  expect(host.querySelectorAll('.hdux-area-chart')).toHaveLength(0);
  expect(host.textContent).not.toContain('CPU');
  expect(host.textContent).toContain('NO SERVICE DATA');
});

test('empty lobby is not ready and arbitrary stats do not fabricate metadata', async () => {
  await render(<GameLobby players={[]} />);
  expect(host.textContent).not.toContain('ALL READY');
  expect(host.textContent).not.toContain('MATCH READY');
  expect(host.textContent).toContain('0/0 READY');
  expect(host.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(host.querySelector('button')?.disabled).toBe(true);
  await render(<GameLobby players={[
    { id: 1, name: 'One', status: 'ready', team: 'A', stat: 'Level 42, wins 12' },
    { id: 2, name: 'Two', status: 'ready', team: 'B', stat: 'Rank 9' },
  ]} />);
  expect(host.querySelectorAll('.hdux-game-lobby__player-ping')).toHaveLength(0);
  expect(host.textContent).not.toContain('AVG');
  expect(host.textContent).toContain('ALL READY');
  await render(<GameLobby players={[
    { id: 1, name: 'One', status: 'ready', team: 'A', mmr: 0, pingMs: 0 },
    { id: 2, name: 'Two', status: 'ready', team: 'B', mmr: 123 },
  ]} />);
  expect(host.textContent).toContain('AVG 0 MMR');
  expect(host.textContent).toContain('AVG 123 MMR');
  expect(host.textContent).toContain('0ms');
});

test('checkout failure is accessible, blocks duplicate submissions, and permits retry', async () => {
  let reject!: (error: Error) => void;
  const checkout = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
  await render(<LandingPage onCtaClick={checkout} />);
  const buttons = Array.from(host.querySelectorAll('button')).filter(b => b.textContent?.includes('GET HDUX'));
  expect(buttons).toHaveLength(2);
  await act(async () => { buttons[0].click(); buttons[1].click(); });
  expect(checkout).toHaveBeenCalledTimes(1);
  expect(buttons.every(b => b.disabled)).toBe(true);
  await act(async () => reject(new Error('Local checkout failure')));
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('Unable to start checkout');
  expect(buttons.every(b => !b.disabled)).toBe(true);
  checkout.mockResolvedValueOnce();
  await act(async () => buttons[1].click());
  expect(checkout).toHaveBeenCalledTimes(2);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await render(<LandingPage />);
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  await act(async () => buttons[0].click());
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('not configured');
  expect(fetchSpy).not.toHaveBeenCalled();
});

for (const width of [320, 375]) {
  test(`all templates render with local validation and reachable controls at ${width}px`, async () => {
    await page.viewport(width, 800);
    for (const child of [<OpsDashboard demoMode />, <GameLobby players={[
      { id: 1, name: 'A_LONG_PLAYER_NAME_12345', status: 'ready', team: 'A', stat: '2841 MMR', mmr: 2841, pingMs: 112, isLocalPlayer: true },
      { id: 2, name: 'SECOND_PLAYER', status: 'loading', team: 'B', stat: '2790 MMR', mmr: 2790, pingMs: 88 },
    ]} />, <LandingPage onCtaClick={async () => {}} />]) {
      await render(child);
      await new Promise(resolve => setTimeout(resolve, 900));
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      for (const el of host.querySelectorAll('button, input, .hdux-game-lobby__player, .hdux-landing__feature-box')) {
        const rect = el.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.right).toBeLessThanOrEqual(width + 1);
      }
    }
  });
}


test('production license validation still fails closed when unavailable or rejected', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'));
  expect((await validateLicense(PRO_KEY, VALIDATION_URL)).valid).toBe(false);
  fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 403 }));
  expect((await validateLicense(PRO_KEY, VALIDATION_URL)).valid).toBe(false);
});

import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { composeStories } from '@storybook/react-vite';
import { HduxProContext } from '../src/pro/ProContext';
import { HduxProProvider } from '../src/pro/ProProvider';
import { validateLicense } from '../src/pro/validateLicense';
import { LandingPage } from '../src/pro/templates/LandingPage/LandingPage';
import { GameLobby } from '../src/pro/templates/GameLobby/GameLobby';
import { OpsDashboard } from '../src/pro/templates/OpsDashboard/OpsDashboard';
import * as stories from '../src/pro/templates/LandingPage/LandingPage.stories';
import { PRO_KEY, VALIDATION_URL, mockProValidation } from '../.storybook/proFixture';

describe('sales-page regressions', () => {
let root: Root;
let host: HTMLDivElement;
function mount(element: React.ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(element));
}
function licensed(element: React.ReactNode) {
  return <HduxProContext.Provider value={{status: 'valid', licenseKey: undefined}}>{element}</HduxProContext.Provider>;
}
afterEach(() => { act(() => root?.unmount()); host?.remove(); vi.restoreAllMocks(); });

it('isolates licensed and unlicensed stories, including under an outer license', async () => {
  const restoreValidation = mockProValidation();
  try {
  const { Default, LightMode } = composeStories(stories);
  mount(<Default />);
  await vi.waitFor(() => expect(host.querySelector('.hdux-pro-gate')).toBeNull());
  act(() => root.render(licensed(<LightMode />)));
  expect(host.querySelectorAll('.hdux-pro-gate').length).toBe(3);
  } finally { restoreValidation(); }
});

it('disables unconfigured or unsafe destinations visibly', () => {
  mount(<LandingPage proUrl="javascript:alert(1)" freeUrl="data:text/html,bad" />);
  expect(host.textContent).toContain('valid HTTP(S)');
  expect((host.querySelector('.hdux-landing__buy-btn') as HTMLButtonElement).disabled).toBe(true);
  act(() => root.render(<LandingPage />));
  expect(host.textContent).toContain('configure a service URL');
  expect(host.textContent).toContain('Free download unavailable');
});

describe('checkout failures and retry', () => {
  for (const [name, response, message] of [
    ['network', () => Promise.reject(new TypeError('network')), 'Unable to connect'],
    ['HTTP', () => Promise.resolve(new Response('', {status: 503})), 'HTTP 503'],
    ['malformed JSON', () => Promise.resolve(new Response('{')), 'malformed data'],
    ['missing URL', () => Promise.resolve(Response.json({})), 'no destination URL'],
    ['null response', () => Promise.resolve(Response.json(null)), 'no destination URL'],
    ['unsafe URL', () => Promise.resolve(Response.json({url: 'javascript:alert(1)'})), 'unsafe or invalid URL'],
  ] as const) {
    it(name, async () => {
      const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(response);
      mount(licensed(<LandingPage serviceUrl="http://localhost:9999" />));
      const button = host.querySelector('.hdux-landing__buy-btn') as HTMLButtonElement;
      await act(async () => button.click());
      expect(host.querySelector('[role="alert"]')?.textContent).toContain(message);
      expect(button.disabled).toBe(false);
      expect(button.textContent).toContain('RETRY');
      await act(async () => button.click());
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9999/v1/checkout/session');
    });
  }
});

it('hydrates the lobby deterministically before simulation starts', async () => {
  const element = licensed(<GameLobby />);
  const random = vi.spyOn(Math, 'random').mockReturnValue(0);
  const html = renderToString(element);
  random.mockReturnValue(0.99);
  expect(renderToString(element)).toBe(html);
  host = document.createElement('div'); document.body.append(host); host.innerHTML = html;
  const errors: unknown[] = [];
  await act(async () => { root = hydrateRoot(host, element, {onRecoverableError: e => errors.push(e)}); });
  expect(errors).toEqual([]);
  expect(host.querySelector('[aria-label="40ms ping"]')).not.toBeNull();
});

it('does not declare an empty roster ready', () => {
  mount(licensed(<GameLobby players={[]} />));
  expect(host.textContent).not.toContain('ALL READY');
  expect(host.textContent).not.toContain('ALL PLAYERS READY');
  expect(host.innerHTML).not.toContain('NaN');
});

it('uses normalized thresholds and consistent invalid-max fallback', () => {
  mount(<div />);
  for (const [value, max, alert, color] of [
    [89, 200, false, null], [150, 200, false, '#ff6f00'],
    [180, 200, true, '#ff1744'], [45, 50, true, '#ff1744'],
    [88, 100, false, '#ff6f00'], [70, 100, false, null],
    [89, 0, true, '#ff1744'], [89, -1, true, '#ff1744'],
    [89, NaN, true, '#ff1744'], [89, Infinity, true, '#ff1744'],
  ] as const) {
    const element = licensed(<OpsDashboard metrics={[{label: 'TEST', value, max}]} />);
    if (!host) mount(element); else act(() => root.render(element));
    expect(host.textContent?.includes('DEGRADED')).toBe(alert);
    const meter = host.querySelector('.hdux-radial-meter');
    expect(meter).not.toBeNull();
    if (color) expect(meter?.getAttribute('style')).toContain(color);
    expect(host.innerHTML).not.toContain('NaN');
  }
});

it('retries a failed checkout and follows a safe response', async () => {
  const fetchMock = vi.spyOn(window, 'fetch')
    .mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValueOnce(Response.json({url: `${window.location.href.split('#')[0]}#checkout-complete`}));
  mount(licensed(<LandingPage serviceUrl="http://localhost:9999/" />));
  const button = host.querySelector('.hdux-landing__buy-btn') as HTMLButtonElement;
  await act(async () => button.click());
  expect(button.textContent).toContain('RETRY');
  await act(async () => button.click());
  await expect.poll(() => window.location.hash).toBe('#checkout-complete');
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  history.replaceState(null, '', window.location.href.split('#')[0]);
});

it('supports theme changes and table sorting from the keyboard', async () => {
  mount(licensed(<LandingPage />));
  const selector = host.querySelector('.hdux-theme-selector') as HTMLButtonElement;
  selector.focus();
  await userEvent.keyboard('{Enter}');
  expect(host.querySelector('[data-hdux-theme]')?.getAttribute('data-hdux-theme')).toBe('custom');
  const header = host.querySelector('th[tabindex="0"]') as HTMLElement;
  await vi.waitFor(() => expect(getComputedStyle(header).visibility).toBe('visible'), { timeout: 4000 });
  header.focus();
  await userEvent.keyboard('{Enter}');
  expect(header.getAttribute('aria-sort')).toBe('ascending');
  await userEvent.keyboard(' ');
  expect(header.getAttribute('aria-sort')).toBe('descending');
});

});

describe('template integration regressions', () => {
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
  const buttons = Array.from(host.querySelectorAll('button')).filter(b => b.classList.contains('hdux-landing__buy-btn'));
  expect(buttons).toHaveLength(4);
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
  expect(buttons.every(b => b.disabled)).toBe(true);
  expect(host.textContent).toContain('configure a service URL');
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

// Test-only placeholder: never navigate to Stripe during local verification.
const supportLink = 'https://buy.stripe.com/test_localFixture';
for (const width of [320, 1280]) {
  for (const licensed of [false, true]) {
    test(`optional support, checkout isolation and keyboard layout: ${width}px, licensed=${licensed}`, async () => {
      await page.viewport(width, 900);
      const checkout = vi.fn();
      const draw = async (link?: string) => {
        await act(async () => root.render(
          <HduxProProvider licenseKey={licensed ? PRO_KEY : ''} validationUrl={VALIDATION_URL} supportPaymentLink={link} checkoutUrl="http://localhost:9999/v1/checkout/session">
            <LandingPage onCtaClick={checkout} />
          </HduxProProvider>
        ));
        if (licensed) await vi.waitFor(() => expect(host.querySelector('.hdux-pro-gate')).toBeNull());
      };
      for (const invalid of [undefined, '', 'https://buy.stripe.com/liveExample', 'https://example.com/test_bad', 'javascript:alert(1)', `${supportLink}?prefilled_email=a`]) {
        await draw(invalid);
        expect(host.querySelector('.hdux-support')).toBeNull();
      }
      await draw(supportLink);
      await new Promise(resolve => setTimeout(resolve, 900));
      const support = Array.from(host.querySelectorAll<HTMLElement>('.hdux-support')).find(el => !el.closest('[inert]'))!;
      expect(support.textContent).toContain('Does not grant a Pro license');
      const link = support.querySelector('a')!;
      expect(link.href).toBe(supportLink);
      await vi.waitFor(() => expect(getComputedStyle(link).visibility).toBe('visible'), { timeout: 4000 });
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
      const activated = vi.fn((event: Event) => event.preventDefault());
      link.addEventListener('click', activated);
      const { userEvent } = await import('vitest/browser');
      // Reach the link with real Tab input, including skipping the inert preview.
      (document.activeElement as HTMLElement)?.blur();
      for (let i = 0; i < 100 && document.activeElement !== link; i++) await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(link);
      expect(getComputedStyle(link).outlineStyle).not.toBe('none');
      await userEvent.keyboard('{Enter}');
      expect(activated).toHaveBeenCalledTimes(1);
      expect(checkout).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      if (!licensed) expect(getComputedStyle(support).color).toBe("rgb(224, 224, 224)");
      const rect = support.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(width + 1);
      if (licensed) {
        await act(async () => host.querySelector<HTMLButtonElement>('.hdux-landing__buy-btn')!.click());
        expect(checkout).toHaveBeenCalledTimes(1);
      } else {
        const buyLink = host.querySelector<HTMLAnchorElement>('.hdux-pro-gate__buy')!;
        expect(buyLink.href).toBe('http://localhost:9999/v1/checkout/session');
        const buyActivated = vi.fn((event: Event) => event.preventDefault());
        buyLink.addEventListener('click', buyActivated);
        await act(async () => buyLink.click());
        expect(buyActivated).toHaveBeenCalledTimes(1);
        expect(fetchSpy).not.toHaveBeenCalled();
      }
      await draw();
      expect(host.querySelector('.hdux-support')).toBeNull();
    });
  }
}
});

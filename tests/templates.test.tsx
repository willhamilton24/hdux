import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';
import { composeStories } from '@storybook/react-vite';
import { HduxProContext } from '../src/pro/ProContext';
import { LandingPage } from '../src/pro/templates/LandingPage/LandingPage';
import { GameLobby } from '../src/pro/templates/GameLobby/GameLobby';
import { OpsDashboard } from '../src/pro/templates/OpsDashboard/OpsDashboard';
import * as stories from '../src/pro/templates/LandingPage/LandingPage.stories';

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

it('isolates licensed and unlicensed stories, including under an outer license', () => {
  const { Default, LightMode } = composeStories(stories);
  mount(<Default />);
  expect(host.querySelector('.hdux-pro-gate')).toBeNull();
  act(() => root.render(licensed(<LightMode />)));
  expect(host.querySelectorAll('.hdux-pro-gate').length).toBe(3);
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
  header.focus();
  await userEvent.keyboard('{Enter}');
  expect(header.getAttribute('aria-sort')).toBe('ascending');
  await userEvent.keyboard(' ');
  expect(header.getAttribute('aria-sort')).toBe('descending');
});

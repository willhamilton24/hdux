import React, { act, useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { commands } from 'vitest/browser';
import { createRoot, type Root } from 'react-dom/client';
import { HduxThemeProvider } from '../src/theme/ThemeProvider';
import { Box } from '../src/components/Box/Box';
import { Text } from '../src/components/Text/Text';
import { useBoxContext } from '../src/components/Box/BoxContext';

function PhaseProbe() {
  return <span data-phase={useBoxContext()?.phase} />;
}

// The vitest.config.ts defines a custom setReducedMotion command that calls
// page.emulateMedia({ reducedMotion: preference }) via Playwright.
const typedCommands = commands as typeof commands & {
  setReducedMotion(preference: 'reduce' | 'no-preference'): Promise<void>;
};

let root: Root;
let host: HTMLDivElement;

function render(element: React.ReactNode) {
  if (!host) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  act(() => root.render(<HduxThemeProvider>{element}</HduxThemeProvider>));
}

afterEach(async () => {
  act(() => root?.unmount());
  host?.remove();
  host = undefined!;
  root = undefined!;
  await typedCommands.setReducedMotion('no-preference');
});

// ── Box tests ────────────────────────────────────────────

it('Box: content reveals immediately under initial reduce preference', async () => {
  await typedCommands.setReducedMotion('reduce');

  let setLoaded!: (v: boolean) => void;
  function Harness() {
    const [loaded, load] = useState(false);
    setLoaded = load;
    return (
      <Box animation="standard" hasLoaded={loaded} style={{ width: 200, minHeight: 80 }}>
        <div data-testid="content">Ready</div>
      </Box>
    );
  }
  render(<Harness />);

  const contentArea = host.querySelector<HTMLElement>('.hdux-box-content')!;
  expect(contentArea.style.visibility).toBe('hidden');

  act(() => setLoaded(true));

  // Should settle without waiting for the full blink + traversal sequence (~1 s+)
  await vi.waitFor(() => {
    expect(contentArea.style.opacity).toBe('1');
  }, { timeout: 300 });
});

it('Box: loading state visible but no CSS animation classes under reduce preference', async () => {
  await typedCommands.setReducedMotion('reduce');
  render(
    <Box
      animation="standard"
      hasLoaded={false}
      loadingAnimations={{ cornerSpin: { duration: 400 }, textPulse: { duration: 600 } }}
      style={{ width: 200, minHeight: 80 }}
    >
      <div>Content</div>
    </Box>
  );

  const box = host.querySelector<HTMLElement>('.hdux-box')!;
  const lt = host.querySelector<HTMLElement>('.hdux-box-loading-text')!;

  // Loading text should be visible (loading state preserved)
  expect(parseFloat(lt.style.opacity)).toBe(1);
  // Decorative animation classes must not be added in reduced-motion mode
  expect(box.classList.contains('hdux-box--corner-spin')).toBe(false);
  expect(box.classList.contains('hdux-box--text-pulse')).toBe(false);
});

it('Box: corners jump to final position without transition under reduce preference', async () => {
  await typedCommands.setReducedMotion('reduce');
  render(
    <Box animation="standard" hasLoaded={true} style={{ width: 200, minHeight: 80 }}>
      <div>Content</div>
    </Box>
  );

  const corner = host.querySelector<HTMLElement>('.hdux-box-corner--tl')!;
  // No inline transition style when reduced motion is active
  expect(corner.style.transition).toBe('');
});

// ── Text tests ───────────────────────────────────────────

it('Text print: reveals all text without typewriter delay under reduce preference', async () => {
  await typedCommands.setReducedMotion('reduce');
  render(
    <Box animation="static" hasLoaded={true} style={{ width: 300 }}>
      <Text animation="print">Hello World</Text>
    </Box>
  );

  // Should settle immediately — no character-by-character delay
  await vi.waitFor(() => {
    const textEl = host.querySelector<HTMLElement>('.hdux-text--print')!;
    expect(textEl.classList.contains('hdux-text--settled')).toBe(true);
  }, { timeout: 200 });

  // When settled, plain children are rendered — no individual character spans
  expect(host.querySelector('.hdux-text-char')).toBeNull();
});

it('Text sweep: settles immediately without sweep animation under reduce preference', async () => {
  await typedCommands.setReducedMotion('reduce');
  render(
    <Box animation="static" hasLoaded={true} style={{ width: 300 }}>
      <Text animation="sweep">Hello World</Text>
    </Box>
  );

  await vi.waitFor(() => {
    const textEl = host.querySelector<HTMLElement>('.hdux-text--sweep')!;
    expect(textEl.classList.contains('hdux-text--settled')).toBe(true);
  }, { timeout: 200 });
});

// ── Preference change test ───────────────────────────────

it('Box: responds to preference change from no-preference to reduce', async () => {
  await typedCommands.setReducedMotion('no-preference');

  let setLoaded!: (v: boolean) => void;
  function Harness() {
    const [loaded, load] = useState(false);
    setLoaded = load;
    return (
      <Box animation="standard" hasLoaded={loaded} style={{ width: 200, minHeight: 80 }}>
        <div>Ready</div>
      </Box>
    );
  }
  render(<Harness />);

  // Confirm the corner has a transition in normal-motion mode
  const corner = host.querySelector<HTMLElement>('.hdux-box-corner--tl')!;
  expect(corner.style.transition).toContain('400ms');

  // Switch to reduce while the box is still in loading state
  await typedCommands.setReducedMotion('reduce');

  // Wait for the media query change event to propagate through the React render cycle.
  // When reducedMotion becomes true, Box removes the inline corner transition.
  await vi.waitFor(() => {
    expect(corner.style.transition).toBe('');
  }, { timeout: 500 });

  expect(host.querySelector<HTMLElement>('.hdux-box-loading-text')!.style.opacity).toBe('1');
  expect(host.querySelector<HTMLElement>('.hdux-box-content')!.style.visibility).toBe('hidden');

  // Trigger load — reducedMotion is now true in the hook, so the transition
  // sequence should skip decorative phases and reveal content immediately.
  act(() => setLoaded(true));

  const contentArea = host.querySelector<HTMLElement>('.hdux-box-content')!;
  await vi.waitFor(() => {
    expect(contentArea.style.opacity).toBe('1');
  }, { timeout: 500 });
});

// Two iterations of each blink reproduce the delayed reveal reported by Monkey.
// Include both traversal orders so a partially completed axis cannot remain stuck.
it.each([
  ['standard', 'text-blink'],
  ['standard', 'corner-blink-start'],
  ['standard', 'traverse-phase-1'],
  ['verticalFirst', 'traverse-phase-1'],
  ['horizontalFirst', 'traverse-phase-1'],
] as const)('Box: reduce interrupts %s during %s', async (animation, targetPhase) => {
  let setLoaded!: (v: boolean) => void;
  function Harness() {
    const [loaded, load] = useState(false);
    setLoaded = load;
    return (
      <Box animation={animation} hasLoaded={loaded} fullBorder
        loadingAnimations={{
          textBlink: { iterations: 2 },
          cornerBlinkStart: { iterations: 2 },
          cornerBlinkEnd: { iterations: 2 },
          contentBlink: { iterations: 2 },
        }}
        style={{ width: 200, minHeight: 80 }}>
        <PhaseProbe />
        <Text animation="print">Ready content</Text>
      </Box>
    );
  }
  render(<Harness />);
  act(() => setLoaded(true));
  await vi.waitFor(() => {
    expect(host.querySelector('[data-phase]')?.getAttribute('data-phase')).toBe(targetPhase);
  }, { timeout: 1600, interval: 10 });

  await typedCommands.setReducedMotion('reduce');
  const box = host.querySelector<HTMLElement>('.hdux-box')!;
  function assertSettled() {
    expect(host.querySelector('[data-phase]')?.getAttribute('data-phase')).toBe('settled');
    const content = host.querySelector<HTMLElement>('.hdux-box-content')!;
    expect(getComputedStyle(content).visibility).toBe('visible');
    expect(getComputedStyle(content).opacity).toBe('1');
    expect(host.querySelector<HTMLElement>('.hdux-box-loading-text')!.style.opacity).toBe('0');
    for (const [position, vertical, horizontal] of [
      ['tl', 'top', 'left'], ['tr', 'top', 'right'],
      ['bl', 'bottom', 'left'], ['br', 'bottom', 'right'],
    ] as const) {
      const corner = host.querySelector<HTMLElement>(`.hdux-box-corner--${position}`)!;
      expect(getComputedStyle(corner)[vertical]).toBe('0px');
      expect(getComputedStyle(corner)[horizontal]).toBe('0px');
    }
    expect(host.querySelectorAll('.hdux-box-border--visible')).toHaveLength(4);
    expect(box.className).toBe('hdux-box');
    expect(box.getAnimations({ subtree: true })).toHaveLength(0);
    expect(host.querySelector('.hdux-text--settled')).not.toBeNull();
    expect(host.querySelector('.hdux-text-char')).toBeNull();
  }
  await vi.waitFor(assertSettled, { timeout: 250, interval: 10 });
  for (const corner of host.querySelectorAll<HTMLElement>('.hdux-box-corner')) {
    expect(corner.style.transition).toBe('');
  }

  // Re-enable motion while the old timers would still be pending. Continuously
  // check beyond the longest original sequence (3070ms), including border fade.
  await typedCommands.setReducedMotion('no-preference');
  const until = performance.now() + 3300;
  while (performance.now() < until) {
    assertSettled();
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  assertSettled();
}, 10000);

it.each(['print', 'sweep'] as const)('Text: reduce interrupts active %s and stays settled', async animation => {
  const content = 'Ready content with enough characters to keep the print animation active.';
  render(<Text animation={animation}>{content}</Text>);
  const text = host.querySelector<HTMLElement>('.hdux-text')!;
  expect(text.classList.contains('hdux-text--animating')).toBe(true);
  if (animation === 'print') {
    await vi.waitFor(() => {
      const visible = host.querySelectorAll('.hdux-text-char--visible').length;
      expect(visible).toBeGreaterThan(0);
      expect(visible).toBeLessThan(content.length);
    }, { timeout: 250, interval: 10 });
  } else {
    expect(text.getAnimations().length).toBeGreaterThan(0);
  }
  await typedCommands.setReducedMotion('reduce');
  function assertSettled() {
    expect(text.classList.contains('hdux-text--settled')).toBe(true);
    expect(text.classList.contains('hdux-text--animating')).toBe(false);
    expect(text.textContent).toBe(content);
    expect(text.querySelector('.hdux-text-char')).toBeNull();
    expect(getComputedStyle(text).opacity).toBe('1');
    expect(getComputedStyle(text).maskImage).toBe('none');
    expect(text.getAnimations({ subtree: true })).toHaveLength(0);
  }
  await vi.waitFor(assertSettled, { timeout: 250, interval: 10 });
  await typedCommands.setReducedMotion('no-preference');
  const until = performance.now() + content.length * 18 + 100;
  while (performance.now() < until) {
    assertSettled();
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  assertSettled();
});

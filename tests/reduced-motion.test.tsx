import React, { act, useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { commands } from 'vitest/browser';
import { createRoot, type Root } from 'react-dom/client';
import { HduxThemeProvider } from '../src/theme/ThemeProvider';
import { Box } from '../src/components/Box/Box';
import { Text } from '../src/components/Text/Text';

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

  // Trigger load — reducedMotion is now true in the hook, so the transition
  // sequence should skip decorative phases and reveal content immediately.
  act(() => setLoaded(true));

  const contentArea = host.querySelector<HTMLElement>('.hdux-box-content')!;
  await vi.waitFor(() => {
    expect(contentArea.style.opacity).toBe('1');
  }, { timeout: 500 });
});

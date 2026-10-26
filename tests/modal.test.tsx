import React, { act, useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createRoot, type Root } from 'react-dom/client';
import { HduxThemeProvider } from '../src/theme/ThemeProvider';
import { Modal } from '../src/components/Modal/Modal';

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

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  host = undefined!;
});

function ModalHarness({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      {/* Plain button so data-testid flows through */}
      <button data-testid="trigger" onClick={() => setOpen(true)}>
        OPEN
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Test Dialog">
        <button data-testid="first-btn">First</button>
        <button data-testid="second-btn">Second</button>
      </Modal>
    </>
  );
}

it('Escape dismisses the modal', async () => {
  render(<ModalHarness initialOpen />);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await userEvent.keyboard('{Escape}');
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it('restores focus to the trigger button after Escape', async () => {
  render(<ModalHarness />);
  const trigger = host.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!;
  // userEvent.click moves focus to the button before dispatching the click event,
  // which is what a real user's click does — so triggerRef captures the button.
  await userEvent.click(trigger);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await userEvent.keyboard('{Escape}');
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('Tab cycles forward through focusable elements inside the dialog', async () => {
  render(<ModalHarness initialOpen />);
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
  // Modal content is portaled into document.body
  const closeBtn = document.querySelector<HTMLButtonElement>('.hdux-modal-close')!;
  const first = document.querySelector<HTMLButtonElement>('[data-testid="first-btn"]')!;
  const second = document.querySelector<HTMLButtonElement>('[data-testid="second-btn"]')!;

  expect(dialog).not.toBeNull();
  expect(closeBtn).not.toBeNull();

  // Focus starts on dialog container after open
  expect(document.activeElement).toBe(dialog);

  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(closeBtn);

  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(first);

  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(second);

  // Tab past last wraps to first focusable
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(closeBtn);
});

it('Shift+Tab cycles backward through focusable elements inside the dialog', async () => {
  render(<ModalHarness initialOpen />);
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
  const second = document.querySelector<HTMLButtonElement>('[data-testid="second-btn"]')!;

  expect(document.activeElement).toBe(dialog);

  // Shift+Tab from dialog container wraps to last focusable
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  expect(document.activeElement).toBe(second);
});

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

const dialogElement = () => document.querySelector<HTMLElement>('[role="dialog"]')!;
const byId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const tab = (reverse = false) => userEvent.keyboard(reverse ? '{Shift>}{Tab}{/Shift}' : '{Tab}');

it('wraps in both directions across both boundaries', async () => {
  render(<ModalHarness initialOpen />);
  const order = [document.querySelector<HTMLElement>('.hdux-modal-close')!, byId('first-btn'), byId('second-btn')];
  for (const target of [...order, order[0]]) {
    await tab();
    expect(document.activeElement).toBe(target);
  }
  for (const target of [order[2], order[1], order[0], order[2]]) {
    await tab(true);
    expect(document.activeElement).toBe(target);
  }
});

it('excludes hidden, inert, disabled and all negative tabindex controls', async () => {
  render(<Modal open>
    <button hidden>Hidden first</button>
    <div style={{ display: 'none' }}><button>Hidden ancestor</button></div>
    <button style={{ visibility: 'hidden' }}>Invisible</button>
    <div {...{ inert: '' }}><button>Inert</button></div>
    <button disabled tabIndex={0}>Disabled</button>
    <fieldset disabled><input aria-label="Disabled fieldset" /></fieldset>
    <input type="hidden" />
    <button tabIndex={-2}>Negative</button>
    <button data-testid="only">Only tabbable</button>
    <button hidden>Hidden last</button>
  </Modal>);
  for (const reverse of [false, false, true, true]) {
    await tab(reverse);
    expect(document.activeElement).toBe(byId('only'));
  }
});

it('keeps both Tab directions on the dialog when there are no tabbable elements', async () => {
  render(<><button data-testid="outside">Outside</button><Modal open><button hidden>Hidden</button><button disabled>Disabled</button></Modal></>);
  for (const reverse of [false, true]) {
    byId('outside').focus();
    await tab(reverse);
    expect(document.activeElement).toBe(dialogElement());
    await tab(reverse);
    expect(document.activeElement).toBe(dialogElement());
  }
});

it('contains escaped focus and focus on non-tabbable descendants in either direction', async () => {
  render(<><button data-testid="outside">Outside</button><Modal open>
    <button data-testid="first">First</button>
    <p tabIndex={-1} data-testid="paragraph">Programmatic focus</p>
    <button data-testid="last">Last</button>
  </Modal></>);
  for (const origin of ['outside', 'paragraph']) {
    for (const reverse of [false, true]) {
      byId(origin).focus();
      await tab(reverse);
      expect(document.activeElement).toBe(byId(reverse ? 'last' : 'first'));
    }
  }
});

it('recomputes tabbability and browser tab order on each keypress', async () => {
  render(<Modal open>
    <button data-testid="two" tabIndex={2}>Two</button>
    <button data-testid="one" tabIndex={1}>One</button>
    <a href="#" data-testid="link">Link</a>
    <div contentEditable suppressContentEditableWarning data-testid="editable">Edit</div>
    <details><summary data-testid="summary">Details</summary><button>Collapsed</button></details>
    <input type="radio" name="choice" aria-label="Unchecked" />
    <input type="radio" name="choice" defaultChecked data-testid="radio" />
    <button data-testid="changing">Changing</button>
  </Modal>);
  const order = ['one', 'two', 'link', 'editable', 'summary', 'radio', 'changing'];
  for (const id of [...order, 'one']) {
    await tab();
    expect(document.activeElement).toBe(byId(id));
  }
  for (const id of [...order].reverse()) {
    await tab(true);
    expect(document.activeElement).toBe(byId(id));
  }
  byId('changing').hidden = true;
  byId('two').tabIndex = -3;
  await tab();
  expect(document.activeElement).toBe(byId('link'));
  byId('one').focus();
  await tab(true);
  expect(document.activeElement).toBe(byId('radio'));
});

it.each(['{Enter}', ' '])('supports repeated keyboard opening with %s and Escape/close restoration', async (key) => {
  render(<React.StrictMode><ModalHarness /></React.StrictMode>);
  const trigger = byId('trigger');
  trigger.focus();
  for (let iteration = 0; iteration < 3; iteration++) {
    await userEvent.keyboard(key);
    expect(document.activeElement).toBe(dialogElement());
    if (iteration === 1) {
      await tab();
      await userEvent.keyboard('{Enter}');
    } else {
      await userEvent.keyboard('{Escape}');
    }
    expect(dialogElement()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  }
});

it('restores the connected trigger on unmount, including StrictMode mount replay', async () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  try {
    render(<React.StrictMode><Modal open><button>Inside</button></Modal></React.StrictMode>);
    expect(document.activeElement).toBe(dialogElement());
    await tab();
    render(<React.StrictMode />);
    expect(document.activeElement).toBe(trigger);
  } finally {
    trigger.remove();
  }
});

it('restores focus after clicking Close', async () => {
  render(<ModalHarness />);
  const trigger = byId('trigger');
  await userEvent.click(trigger);
  await userEvent.click(document.querySelector<HTMLElement>('.hdux-modal-close')!);
  expect(dialogElement()).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

import React, { act, createRef, useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createRoot, type Root } from 'react-dom/client';
import { HduxThemeProvider, Select, Checkbox, TextArea } from '../src';

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
afterEach(() => { act(() => root?.unmount()); host?.remove(); host = undefined!; });

it('forwards refs, associates labels and descriptions, and prioritizes errors', () => {
  const select = createRef<HTMLSelectElement>();
  const checkbox = createRef<HTMLInputElement>();
  const textarea = createRef<HTMLTextAreaElement>();
  render(<>
    <span id="external">External description</span>
    <Select ref={select} label="Plan" helperText="Select help" aria-describedby="external"><option>Pro</option></Select>
    <Checkbox ref={checkbox} label="Terms" helperText="Hidden helper" errorText="Accept terms" required />
    <TextArea ref={textarea} id="notes" label="Notes" helperText="Notes help" />
  </>);
  for (const control of [select.current!, checkbox.current!, textarea.current!]) {
    expect(control.labels?.length).toBe(1);
    control.focus();
    expect(document.activeElement).toBe(control);
    for (const id of control.getAttribute('aria-describedby')!.split(' ')) expect(document.getElementById(id)).not.toBeNull();
  }
  expect(select.current!.getAttribute('aria-describedby')).toContain('external ');
  expect(checkbox.current!.getAttribute('aria-invalid')).toBe('true');
  expect(checkbox.current!.checkValidity()).toBe(false);
  expect(host.textContent).toContain('Accept terms');
  expect(host.textContent).not.toContain('Hidden helper');
  expect(textarea.current!.id).toBe('notes');
  render(<Checkbox ref={checkbox} label="Terms" helperText="Now valid" />);
  expect(checkbox.current!.hasAttribute('aria-invalid')).toBe(false);
  expect(document.getElementById(checkbox.current!.getAttribute('aria-describedby')!)?.textContent).toBe('Now valid');
});

it('supports native form values, reset, required validation, and disabled exclusion', async () => {
  render(<form>
    <Select label="Plan" name="plan" defaultValue="pro"><option value="starter">Starter</option><option value="pro">Pro</option></Select>
    <Checkbox label="Terms" name="terms" value="accepted" defaultChecked />
    <TextArea label="Notes" name="notes" defaultValue="Leave at door" />
    <Checkbox label="Disabled" name="disabled" defaultChecked disabled />
  </form>);
  const form = host.querySelector('form')!;
  expect(Object.fromEntries(new FormData(form))).toEqual({ plan: 'pro', terms: 'accepted', notes: 'Leave at door' });
  await userEvent.click(host.querySelector('label[for="' + host.querySelector('input')!.id + '"]')!);
  expect(new FormData(form).has('terms')).toBe(false);
  act(() => form.reset());
  expect(new FormData(form).get('terms')).toBe('accepted');
});

it('supports controlled changes and keyboard checkbox activation', async () => {
  function Form() {
    const [plan, setPlan] = useState('starter');
    const [checked, setChecked] = useState(false);
    const [notes, setNotes] = useState('');
    return <>
      <Select label="Plan" value={plan} onChange={e => setPlan(e.target.value)}><option value="starter">Starter</option><option value="pro">Pro</option></Select>
      <Checkbox label="Terms" checked={checked} onChange={e => setChecked(e.target.checked)} />
      <TextArea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
      <output>{`${plan}/${checked}/${notes}`}</output>
    </>;
  }
  render(<Form />);
  await userEvent.selectOptions(host.querySelector('select')!, 'pro');
  host.querySelector('input')!.focus();
  await userEvent.keyboard(' ');
  await userEvent.fill(host.querySelector('textarea')!, 'Deliver tomorrow');
  expect(host.querySelector('output')!.textContent).toBe('pro/true/Deliver tomorrow');
});

it('inherits theme corners and allows wrapper overrides', () => {
  render(<Select label="Plan" color="#123456" cornerLength={8} cornerWidth={3} className="custom" style={{ width: 320 }}><option>Pro</option></Select>);
  const wrapper = host.querySelector<HTMLElement>('.custom')!;
  expect(wrapper.style.getPropertyValue('--hdux-input-color')).toBe('#123456');
  expect(wrapper.style.getPropertyValue('--hdux-input-corner-len')).toBe('8px');
  expect(wrapper.style.getPropertyValue('--hdux-input-corner-wid')).toBe('3px');
  expect(getComputedStyle(host.querySelector('select')!).width).toBe('320px');
});

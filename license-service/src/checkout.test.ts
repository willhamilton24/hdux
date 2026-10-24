import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';

const mocks = vi.hoisted(() => ({
  create: vi.fn(), listLineItems: vi.fn(), constructEvent: vi.fn(), createLicense: vi.fn(),
}));
vi.mock('stripe', () => ({ default: class {
  checkout = { sessions: { create: mocks.create, listLineItems: mocks.listLineItems } };
  webhooks = { constructEvent: mocks.constructEvent };
} }));
vi.mock('./db', () => ({ migrate: vi.fn(), createLicense: mocks.createLicense,
  findLicenseByKey: vi.fn(), findLicenseBySession: vi.fn() }));
vi.mock('./email', () => ({ sendLicenseEmail: vi.fn() }));
let server: Server;
let base: string;
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_local_mock');
  vi.stubEnv('SERVICE_URL', 'http://127.0.0.1:10000');
  vi.stubEnv('APP_URL', 'http://localhost:3000');
  mocks.create.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test_mock', livemode: false });
  const { app } = await import('./index');
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterEach(async () => {
  server?.closeAllConnections();
  if (server) await new Promise<void>(resolve => server.close(() => resolve()));
  vi.unstubAllEnvs();
});
const post = (body: unknown, path = '/v1/support/checkout') => fetch(base + path, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

it('creates distinct fixed support and Pro sessions with configured returns', async () => {
  expect((await post({})).status).toBe(200);
  const support = mocks.create.mock.calls[0][0];
  expect(support.metadata.product).toBe('hdux-support');
  expect(support.line_items[0].price_data.unit_amount).toBe(500);
  expect(support.success_url).toBe('http://127.0.0.1:10000/v1/support/thanks');
  expect(support.cancel_url).toBe('http://localhost:3000/');
  expect((await post({}, '/v1/checkout/session')).status).toBe(200);
  expect(mocks.create.mock.calls[1][0].metadata.product).toBe('hdux-pro');
  expect(mocks.create.mock.calls[1][0].line_items[0].price).toMatch(/^price_/);
});
it.each(['/v1/support/checkout', '/v1/checkout/session'])('supports browser navigation to %s', async path => {
  const response = await fetch(base + path, { redirect: 'manual' });
  expect(response.status).toBe(303);
  expect(response.headers.get('location')).toBe('https://checkout.stripe.com/c/pay/cs_test_mock');
});
it.each([
  [], { email: 42 }, { email: 'invalid' }, { amount: 1 }, { price: 'price_other' },
  { cancel_url: 'https://untrusted.example' }, { success_url: 'javascript:alert(1)' },
  { cancel_url: 'http://user:pass@localhost:3000' }, { success_url: [] },
])('rejects invalid or overridden checkout input: %j', async body => {
  expect((await post(body)).status).toBe(400);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('allows configured-origin redirects and email', async () => {
  expect((await post({ email: 'test@example.com', cancel_url: 'http://localhost:3000/cancel' })).status).toBe(200);
});
it.each([null, 'https://evil.example', 'javascript:alert(1)'])('fails closed for invalid Stripe URL %j', async url => {
  mocks.create.mockResolvedValue({ url, livemode: false });
  expect((await post({})).status).toBe(503);
});
it('fails closed for Stripe errors and live sessions', async () => {
  mocks.create.mockRejectedValueOnce(new Error('provider unavailable'));
  expect((await post({})).status).toBe(503);
  mocks.create.mockResolvedValue({ url: 'https://checkout.stripe.com/session', livemode: true });
  expect((await post({})).status).toBe(503);
});
it('rejects live keys and missing/unsafe service configuration before calling Stripe', async () => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_mock');
  expect((await post({})).status).toBe(503);
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_local_mock');
  vi.stubEnv('SERVICE_URL', 'http://untrusted.example');
  expect((await post({})).status).toBe(503);
  vi.stubEnv('SERVICE_URL', '');
  vi.stubEnv('APP_URL', '');
  expect((await post({})).status).toBe(503);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('never issues a Pro license for a paid support session', async () => {
  mocks.constructEvent.mockReturnValue({ type: 'checkout.session.completed', livemode: false,
    data: { object: { id: 'cs_test_support', livemode: false, payment_status: 'paid', metadata: { product: 'hdux-support' } } } });
  const response = await fetch(base + '/api/stripe/webhook', { method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': 'mock' }, body: '{}' });
  expect(response.status).toBe(200);
  expect(mocks.listLineItems).not.toHaveBeenCalled();
  expect(mocks.createLicense).not.toHaveBeenCalled();
});

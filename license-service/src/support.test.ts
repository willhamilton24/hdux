import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';

const mocks = vi.hoisted(() => ({
  event: {} as any,
  list: vi.fn(), create: vi.fn(), issue: vi.fn(), email: vi.fn(),
}));
vi.mock('stripe', () => ({ default: class {
  webhooks = { constructEvent: () => mocks.event };
  checkout = { sessions: { listLineItems: mocks.list, create: mocks.create } };
} }));
vi.mock('./db', () => ({
  migrate: vi.fn(), createLicense: mocks.issue, findLicenseByKey: vi.fn(),
  findLicenseBySession: vi.fn().mockResolvedValue(null),
}));
vi.mock('./email', () => ({ sendLicenseEmail: mocks.email }));
import { app } from './index';
let server: Server;
let base: string;
beforeAll(async () => {
  server = await new Promise<Server>(resolve => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
it('support never issues a key; ordinary Pro checkout still does', async () => {
  const proPrice = process.env.STRIPE_PRICE_ID ?? 'price_1UStJ7GRjKD6n9dmqdwh3trU';
  for (const [product, price, issued] of [
    ['hdux-support', proPrice, false],
    ['hdux-support', 'price_support_fixture', false],
    [undefined, 'price_support_fixture', false],
    ['hdux-pro', proPrice, true],
  ] as const) {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue({ data: [{ price: { id: price } }] });
    mocks.event = { type: 'checkout.session.completed', data: { object: {
      id: 'cs_test_fixture', payment_status: 'paid', metadata: { product }, customer_details: { email: 'test@example.invalid' },
    } } };
    const response = await fetch(`${base}/api/stripe/webhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': 'mock' }, body: '{}',
    });
    expect(response.status).toBe(200);
    expect(mocks.issue).toHaveBeenCalledTimes(issued ? 1 : 0);
    expect(mocks.email).toHaveBeenCalledTimes(issued ? 1 : 0);
  }
  mocks.create.mockResolvedValue({ url: 'https://checkout.stripe.com/test_fixture' });
  expect((await fetch(`${base}/v1/checkout/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(200);
  expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
    line_items: [{ price: proPrice, quantity: 1 }], metadata: { product: 'hdux-pro' },
  }));
});

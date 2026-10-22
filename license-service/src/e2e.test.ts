/**
 * Private Stripe checkout E2E. An operator completes the test-mode Checkout URL
 * written to a private temporary file. No public webhook is registered: the real
 * Stripe event is retrieved and re-signed for loopback delivery. This checks event
 * handling, not Stripe's public webhook delivery infrastructure.
 */
import http from 'http';
import { randomUUID } from 'crypto';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { expect, it, vi } from 'vitest';
import { validateLicense } from '../../src/pro/validateLicense';

it('completed test checkout → real event → issued key → real validator → revocation', async () => {
  // Fail before importing the service, opening a database, or contacting Stripe.
  const secret = process.env.STRIPE_SECRET_KEY;
  const database = process.env.TEST_DATABASE_URL;
  const price = process.env.STRIPE_PRICE_ID;
  if (!secret || !database || !price) {
    throw new Error('BLOCKED: STRIPE_SECRET_KEY, TEST_DATABASE_URL and STRIPE_PRICE_ID are required; E2E did not run.');
  }
  if (!/^sk_test_[A-Za-z0-9]+$/.test(secret)) {
    throw new Error('BLOCKED: only sk_test_ Stripe credentials are permitted.');
  }
  const schema = `hdux_e2e_${randomUUID().replace(/-/g, '')}`;
  const isolatedUrl = new URL(database);
  if (!['postgres:', 'postgresql:'].includes(isolatedUrl.protocol)) {
    throw new Error('BLOCKED: TEST_DATABASE_URL must be a PostgreSQL connection URL.');
  }
  // No public fallback in search_path: migrations and both pools use only this schema.
  isolatedUrl.searchParams.set('options', `-c search_path=${schema}`);
  const overrides = {
    DATABASE_URL: isolatedUrl.toString(),
    STRIPE_WEBHOOK_SECRET: `whsec_${randomUUID()}`,
    STRIPE_PRICE_ID: price,
    SERVICE_URL: 'http://127.0.0.1',
    SMTP_HOST: '', // Do not send email to the checkout identity during this test.
  };
  const previous = new Map(Object.keys(overrides).map(key => [key, process.env[key]]));
  let admin: Pool | undefined;
  let pool: Pool | undefined;
  let closeDatabase: (() => Promise<void>) | undefined;
  let server: http.Server | undefined;
  let directory: string | undefined;
  let schemaCreated = false;
  let sessionId: string | undefined;
  const stripe = new Stripe(secret, { timeout: 10_000, maxNetworkRetries: 0 });
  try {
    admin = new Pool({ connectionString: database, connectionTimeoutMillis: 10_000 });
    await admin.query(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    Object.assign(process.env, overrides);
    vi.resetModules();
    // Capture the service pool's disposer before any later import/setup can fail.
    const db = await import('./db');
    closeDatabase = db.closeDatabase;
    await db.migrate();
    pool = new Pool({ connectionString: isolatedUrl.toString(), connectionTimeoutMillis: 10_000 });
    server = http.createServer();
    await new Promise<void>((resolve, reject) => {
      server!.once('error', reject);
      server!.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing loopback address');
    const base = `http://127.0.0.1:${address.port}`;
    process.env.SERVICE_URL = base;
    const { app } = await import('./index');
    server.on('request', app);
    const started = Math.floor(Date.now() / 1000);
    const checkout = await fetch(`${base}/v1/checkout/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success_url: `${base}/v1/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/health`,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    expect(checkout.status).toBe(200);
    const { url } = await checkout.json() as { url: string };
    // Hosted Checkout embeds the session ID in its URL; never print the URL or ID.
    const checkoutUrl = new URL(url);
    expect(checkoutUrl.origin).toBe('https://checkout.stripe.com');
    sessionId = checkoutUrl.pathname.match(/\bcs_test_[A-Za-z0-9]+/)?.[0];
    if (!sessionId) throw new Error('Expected a test-mode Checkout session URL');
    const initial = await stripe.checkout.sessions.retrieve(sessionId);
    expect(initial.livemode).toBe(false);
    expect(initial.status).toBe('open');
    expect(initial.metadata?.product).toBe('hdux-pro');
    directory = await mkdtemp(join(tmpdir(), 'hdux-checkout-'));
    const checkoutFile = join(directory, 'checkout-url.txt');
    await writeFile(checkoutFile, url, { mode: 0o600 });
    console.info(`Private operator action: complete Stripe TEST checkout using ${checkoutFile} within 180 seconds. No public endpoint is needed.`);

    let event: Stripe.Event | undefined;
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
      const completed = await stripe.checkout.sessions.retrieve(sessionId);
      expect(completed.livemode).toBe(false);
      if (completed.status === 'complete' && completed.payment_status === 'paid') {
        // Paginate rather than assume the matching event is in the first page.
        for await (const candidate of stripe.events.list({
          type: 'checkout.session.completed', created: { gte: started - 5 }, limit: 100,
        })) {
          if ((candidate.data.object as Stripe.Checkout.Session).id === sessionId) {
            event = candidate;
            break;
          }
        }
        if (event) break;
      }
      await new Promise(resolve => setTimeout(resolve, 2_000));
    }
    if (!event) throw new Error('BLOCKED: no completed paid test checkout and matching Stripe event observed; E2E did not complete.');
    expect(event.livemode).toBe(false);
    const completed = event.data.object as Stripe.Checkout.Session;
    expect(completed.id).toBe(sessionId);
    expect(completed.status).toBe('complete');
    expect(completed.payment_status).toBe('paid');
    const payload = JSON.stringify(event); // Preserve the real event; do not fabricate paid status.
    const webhook = await fetch(`${base}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripe.webhooks.generateTestHeaderString({
          payload, secret: overrides.STRIPE_WEBHOOK_SECRET,
        }),
      },
      body: payload,
      signal: AbortSignal.timeout(20_000),
    });
    expect(webhook.status).toBe(200);
    expect(await webhook.json()).toEqual({ received: true });
    const result = await pool.query<{ key: string }>('SELECT key FROM licenses WHERE session_id = $1', [sessionId]);
    expect(result.rows).toHaveLength(1);
    const key = result.rows[0].key;
    const lookup = await fetch(`${base}/v1/license/by-session/${sessionId}`);
    expect(lookup.status).toBe(200);
    expect((await lookup.json() as { key: string }).key).toBe(key);
    // The actual validator is stateless (no cache); both calls reach the service.
    expect(await validateLicense(key, `${base}/v1/license/validate`)).toEqual({ valid: true });
    await pool.query('UPDATE licenses SET revoked_at = NOW() WHERE key = $1', [key]);
    expect(await validateLicense(key, `${base}/v1/license/validate`)).toEqual({ valid: false, reason: 'License revoked' });
    console.info('Verified: app checkout, Stripe-confirmed paid test session, matching real event replayed on loopback, correlated key, validator accepted then rejected after revocation.');
  } finally {
    // Attempt every disposer, even after partial setup or another cleanup failure.
    const failures: string[] = [];
    const cleanup = async (name: string, action: () => Promise<unknown>) => {
      try { await action(); } catch { failures.push(name); }
    };
    if (server?.listening) await cleanup('server', () => new Promise<void>((resolve, reject) => {
      server!.close(error => error ? reject(error) : resolve());
      server!.closeAllConnections();
    }));
    if (closeDatabase) await cleanup('service pool', closeDatabase);
    if (pool) await cleanup('test pool', () => pool!.end());
    if (schemaCreated) await cleanup('test schema and records', () => admin!.query(`DROP SCHEMA "${schema}" CASCADE`));
    if (admin) await cleanup('admin pool', () => admin!.end());
    if (directory) await cleanup('private checkout file', () => rm(directory!, { recursive: true, force: true }));
    if (sessionId) await cleanup('open Stripe test session', async () => {
      const session = await stripe.checkout.sessions.retrieve(sessionId!);
      if (session.status === 'open') await stripe.checkout.sessions.expire(sessionId!);
    });
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    vi.resetModules();
    if (failures.length) throw new Error(`E2E cleanup failed: ${failures.join(', ')}`);
  }
}, 240_000);

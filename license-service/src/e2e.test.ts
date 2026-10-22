/**
 * Stripe test-mode E2E: checkout → webhook → key issued → validateLicense accepts → revoke → rejects
 *
 * Requires env: STRIPE_SECRET_KEY (sk_test_…), DATABASE_URL
 * STRIPE_WEBHOOK_SECRET is overridden with a local test value so no live webhook registration
 * is needed — events are signed in-process with stripe.webhooks.generateTestHeaderString.
 *
 * validateLicense (src/pro/validateLicense.ts) is exercised via the same HTTP contract: it
 * POSTs { key } to /v1/license/validate and reads { valid } / { error }.  The helper below
 * reproduces that call so the license-service test stays self-contained.
 */

import http from 'http';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const STRIPE_PRICE_ID =
  process.env.STRIPE_PRICE_ID ?? 'price_1UStJ7GRjKD6n9dmqdwh3trU';

// A local signing secret — no live webhook endpoint needed
const TEST_WEBHOOK_SECRET = 'whsec_test_hdux_e2e_local_signing_key_0000000';

// Mirror of validateLicense from src/pro/validateLicense.ts, called against the local server
async function validateLicense(
  key: string,
  validationUrl: string,
): Promise<{ valid: true } | { valid: false; reason: string }> {
  const res = await fetch(validationUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return {
      valid: false,
      reason: (json as { error?: string }).error ?? 'License invalid',
    };
  }
  return { valid: true };
}

describe.skipIf(!STRIPE_SECRET_KEY || !DATABASE_URL)(
  'Stripe test-mode E2E',
  () => {
    let stripe: Stripe;
    let pool: Pool;
    let server: http.Server;
    let serverUrl: string;
    let validateUrl: string;

    beforeAll(async () => {
      // Override webhook secret before the module is loaded so it captures our test value
      process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
      process.env.STRIPE_PRICE_ID = STRIPE_PRICE_ID;

      // Fresh module load so the webhook handler uses the test secret above
      vi.resetModules();
      const mod = await import('./index');
      await mod.migrate();

      server = http.createServer(mod.app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const addr = server.address() as { port: number };
      serverUrl = `http://localhost:${addr.port}`;
      validateUrl = `${serverUrl}/v1/license/validate`;

      stripe = new Stripe(STRIPE_SECRET_KEY!);
      pool = new Pool({ connectionString: DATABASE_URL });
    }, 20_000);

    afterAll(async () => {
      await pool?.end();
      await new Promise<void>((resolve, reject) =>
        server?.close((err) => (err ? reject(err) : resolve())),
      );
    });

    it(
      'issues a key via webhook and validates / rejects it correctly',
      async () => {
        // ── Step 1: Create a real Stripe test-mode checkout session ──────────
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
          success_url: 'https://hdux.dev/success',
          cancel_url: 'https://hdux.dev',
          customer_email: 'e2e-test@hdux.dev',
        });

        expect(session.id).toBeTruthy();

        // ── Step 2: Build a signed checkout.session.completed event ──────────
        // We set payment_status = 'paid' to simulate a completed payment.
        // The webhook handler will call stripe.checkout.sessions.listLineItems(session.id)
        // which hits the real Stripe test API and returns the HDUX Pro price line item.
        const eventPayload = {
          id: `evt_test_e2e_${Date.now()}`,
          object: 'event',
          api_version: '2023-10-16',
          created: Math.floor(Date.now() / 1000),
          type: 'checkout.session.completed',
          data: {
            object: {
              ...session,
              payment_status: 'paid',
            },
          },
          livemode: false,
          pending_webhooks: 1,
          request: null,
        };

        const payloadString = JSON.stringify(eventPayload);
        const signature = stripe.webhooks.generateTestHeaderString({
          payload: payloadString,
          secret: TEST_WEBHOOK_SECRET,
        });

        // ── Step 3: POST to the webhook endpoint ─────────────────────────────
        const webhookRes = await fetch(`${serverUrl}/api/stripe/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'stripe-signature': signature,
          },
          body: payloadString,
        });

        expect(webhookRes.status).toBe(200);
        const webhookBody = (await webhookRes.json()) as { received: boolean };
        expect(webhookBody.received).toBe(true);

        // ── Step 4: Confirm the key was written to the database ──────────────
        const dbResult = await pool.query<{ key: string }>(
          'SELECT key FROM licenses WHERE session_id = $1',
          [session.id],
        );
        expect(dbResult.rows).toHaveLength(1);
        const key = dbResult.rows[0].key;
        expect(key).toMatch(
          /^HDUX-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
        );

        // ── Step 5: validateLicense accepts the issued key ───────────────────
        const acceptResult = await validateLicense(key, validateUrl);
        expect(acceptResult.valid).toBe(true);

        // ── Step 6: Revoke the key ────────────────────────────────────────────
        await pool.query('UPDATE licenses SET revoked_at = NOW() WHERE key = $1', [key]);

        // ── Step 7: validateLicense rejects the revoked key ──────────────────
        const revokedResult = await validateLicense(key, validateUrl);
        expect(revokedResult.valid).toBe(false);
        if (!revokedResult.valid) {
          expect(revokedResult.reason).toBe('License revoked');
        }

        // ── Cleanup: remove the test license row ──────────────────────────────
        await pool.query('DELETE FROM licenses WHERE session_id = $1', [session.id]);
      },
      60_000, // Stripe API calls + DB round-trips can take several seconds
    );
  },
);

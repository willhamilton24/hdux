import type { Express } from 'express';
import type Stripe from 'stripe';

class InvalidInput extends Error {}

function safeUrl(value: string): URL {
  const url = new URL(value);
  if (url.username || url.password || !(url.protocol === 'https:' ||
    (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error('Expected HTTPS or loopback HTTP URL');
  }
  return url;
}

export function installCheckout(app: Express, stripe: Stripe, proPrice: string): void {
  for (const kind of ['pro', 'support'] as const) {
    const route = kind === 'pro' ? '/v1/checkout/session' : '/v1/support/checkout';
    const create = async (input: unknown): Promise<string> => {
      if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Test mode required');
      const service = safeUrl(process.env.SERVICE_URL ?? process.env.APP_URL ?? '');
      const application = safeUrl(process.env.APP_URL ?? process.env.SERVICE_URL ?? '');
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InvalidInput();
      const body = input as Record<string, unknown>;
      if (Object.keys(body).some(key => !['email', 'success_url', 'cancel_url'].includes(key))) throw new InvalidInput();
      if (body.email !== undefined && (typeof body.email !== 'string' || body.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) throw new InvalidInput();
      const redirect = (value: unknown, fallback: string): string => {
        if (value === undefined) return fallback;
        try {
          if (typeof value !== 'string') throw new Error();
          const url = safeUrl(value);
          if (![service.origin, application.origin].includes(url.origin)) throw new Error();
          return value;
        } catch { throw new InvalidInput(); }
      };
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: kind === 'pro' ? [{ price: proPrice, quantity: 1 }] : [{
          price_data: {
            currency: 'usd', unit_amount: 500,
            product_data: { name: 'HDUX optional support', description: 'One-time contribution; does not include a Pro license.' },
          }, quantity: 1,
        }],
        customer_email: body.email as string | undefined,
        success_url: redirect(body.success_url, kind === 'pro'
          ? `${service.origin}/v1/checkout/success?session_id={CHECKOUT_SESSION_ID}`
          : `${service.origin}/v1/support/thanks`),
        cancel_url: redirect(body.cancel_url, application.href),
        metadata: { product: kind === 'pro' ? 'hdux-pro' : 'hdux-support' },
      });
      if (session.livemode || !session.url || safeUrl(session.url).origin !== 'https://checkout.stripe.com') {
        throw new Error('Invalid hosted test checkout URL');
      }
      return session.url;
    };
    app.post(route, async (req, res): Promise<void> => {
      try {
        res.json({ url: await create(req.body ?? {}) });
      } catch (error) {
        res.status(error instanceof InvalidInput ? 400 : 503).json({ error:
          error instanceof InvalidInput ? 'Invalid checkout input' : 'Checkout unavailable' });
      }
    });
    // GET supports ordinary browser links; POST supports same-origin integrations.
    app.get(route, async (_req, res): Promise<void> => {
      try { res.redirect(303, await create({})); }
      catch { res.status(503).send('Checkout unavailable. Please try again later.'); }
    });
  }
  app.get('/v1/support/thanks', (_req, res) => {
    res.type('html').send('<!doctype html><html lang="en"><title>HDUX support</title><h1>Thank you for supporting HDUX</h1><p>This test-mode contribution does not include a Pro license. Payment status is available in Stripe.</p></html>');
  });
}

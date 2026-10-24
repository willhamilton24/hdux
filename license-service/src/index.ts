import express from 'express';
import Stripe from 'stripe';
import { installCheckout } from './checkout';
import { migrate, createLicense, findLicenseByKey, findLicenseBySession } from './db';
import { generateKey } from './keys';
import { sendLicenseEmail } from './email';

export { migrate } from './db';

const PORT = Number(process.env.PORT ?? 10000);
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? 'price_1UStJ7GRjKD6n9dmqdwh3trU';
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret?.startsWith('sk_test_')) throw new Error('Only Stripe test mode is enabled');

const stripe = new Stripe(secret);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const app = express();

// Stripe requires the raw body for signature verification
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res): Promise<void> => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch {
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only issue keys for paid sessions on the HDUX Pro price
        if (!event.livemode && !session.livemode && session.metadata?.product === 'hdux-pro' && session.payment_status === 'paid') {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
          const hasPro = lineItems.data.some((item) => item.price?.id === STRIPE_PRICE_ID);

          if (hasPro) {
            const email = session.customer_details?.email ?? null;
            // Idempotent across Stripe retries: reuse the existing key rather
            // than generating a new one the DB would silently discard
            const existing = await findLicenseBySession(session.id);
            const key = existing?.key ?? generateKey();
            if (!existing) {
              await createLicense({ key, sessionId: session.id, email });
            }
            if (email) {
              // Email is best-effort: the license row is already committed, so
              // an SMTP failure must not make Stripe retry the whole event
              try {
                await sendLicenseEmail(email, key);
              } catch (emailErr) {
                console.error('License email failed (key still issued):', emailErr);
              }
            }
          }
        }
      }

      res.json({ received: true });
    } catch (err) {
      // 500 so Stripe retries delivery; the session-id lookup above keeps retries idempotent
      console.error('Webhook processing failed:', err);
      res.status(500).json({ error: 'Internal error' });
    }
  },
);

app.use(express.json());

installCheckout(app, stripe, STRIPE_PRICE_ID);

// Success page — surfaces the license key to the buyer after checkout
app.get('/v1/checkout/success', async (req, res): Promise<void> => {
  const sessionId = req.query.session_id as string | undefined;
  if (!sessionId) {
    res.status(400).send('<h1>Missing session_id</h1>');
    return;
  }
  try {
    const license = await findLicenseBySession(sessionId);
    const key = license?.key ?? '(still processing — check your email shortly)';
    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HDUX Pro — License Key</title>
  <style>
    body { background: #0a0a1a; color: #e0e0e0; font-family: monospace; max-width: 640px; margin: 80px auto; padding: 0 24px; }
    h1 { color: #00d4ff; letter-spacing: .1em; }
    .key { background: #111; border: 1px solid #00d4ff; color: #00d4ff; padding: 16px 24px; font-size: 1.1rem; margin: 24px 0; word-break: break-all; }
    p { line-height: 1.7; }
    a { color: #00d4ff; }
    pre { background: #111; padding: 16px; overflow: auto; }
  </style>
</head>
<body>
  <h1>HDUX PRO</h1>
  <p>Thank you for your purchase! Your license key is below. If you entered an email at checkout, a copy has been sent there.</p>
  <div class="key">${key}</div>
  <p>Add it to your app:</p>
  <pre>&lt;HduxProProvider licenseKey="${key}"&gt;\n  {/* your app */}\n&lt;/HduxProProvider&gt;</pre>

</body>
</html>`);
  } catch (err) {
    console.error('Success page error:', err);
    res.status(500).send('<h1>Error loading license</h1>');
  }
});

app.post('/v1/license/validate', async (req, res): Promise<void> => {
  const body = req.body as { key?: unknown };
  if (!body.key || typeof body.key !== 'string') {
    res.status(400).json({ error: 'key is required' });
    return;
  }

  try {
    const normalized = body.key.toUpperCase().trim();
    const license = await findLicenseByKey(normalized);

    if (!license) {
      res.status(401).json({ error: 'License not found' });
      return;
    }
    if (license.revoked_at) {
      res.status(401).json({ error: 'License revoked' });
      return;
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('License validation failed:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Checkout success page uses this to surface the key to the buyer
app.get('/v1/license/by-session/:sessionId', async (req, res): Promise<void> => {
  try {
    const license = await findLicenseBySession(req.params.sessionId);
    if (!license) {
      res.status(404).json({ error: 'No license found for this session' });
      return;
    }
    res.json({ key: license.key, email: license.email });
  } catch (err) {
    console.error('License lookup by session failed:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

export { app };

if (require.main === module) {
  migrate()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`License service listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to run migrations:', err);
      process.exit(1);
    });
}

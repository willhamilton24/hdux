import express from 'express';
import Stripe from 'stripe';
import { migrate, createLicense, findLicenseByKey, findLicenseBySession } from './db';
import { generateKey } from './keys';

const PORT = Number(process.env.PORT ?? 10000);
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? 'price_1UStJ7GRjKD6n9dmqdwh3trU';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only issue keys for paid sessions on the HDUX Pro price
      if (session.payment_status === 'paid') {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
        const hasPro = lineItems.data.some((item) => item.price?.id === STRIPE_PRICE_ID);

        if (hasPro) {
          const key = generateKey();
          await createLicense({
            key,
            sessionId: session.id,
            email: session.customer_details?.email ?? null,
          });
        }
      }
    }

    res.json({ received: true });
  },
);

app.use(express.json());

app.post('/v1/license/validate', async (req, res): Promise<void> => {
  const body = req.body as { key?: unknown };
  if (!body.key || typeof body.key !== 'string') {
    res.status(400).json({ error: 'key is required' });
    return;
  }

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
});

// Checkout success page uses this to surface the key to the buyer
app.get('/v1/license/by-session/:sessionId', async (req, res): Promise<void> => {
  const license = await findLicenseBySession(req.params.sessionId);
  if (!license) {
    res.status(404).json({ error: 'No license found for this session' });
    return;
  }
  res.json({ key: license.key, email: license.email });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

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

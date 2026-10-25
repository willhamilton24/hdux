// Private operator helper: credentials stay in memory and in the child env.
// Uses THRONE's repo-aware credential selection, never a separate provider account.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

try {
  const modulePath = process.env.THRONE_PLATFORM_MODULE
    ?? join(homedir(), 'Desktop/Workspace/throne/dist/platform.js');
  const { secretsFor } = await import(pathToFileURL(modulePath).href);
  const secrets = secretsFor('hdux');
  const stored = Object.entries(secrets.pendingEnv)
    .find(([repo]) => repo.split('/').pop().toLowerCase() === 'hdux')?.[1] ?? {};
  const stripe = stored.STRIPE_SECRET_KEY ?? secrets.stripe.secretKey;
  const database = stored.DATABASE_URL;
  if (!/^sk_test_[A-Za-z0-9]+$/.test(stripe ?? '') || !database) {
    throw new Error('Missing stored test configuration');
  }
  const child = spawn('npm', ['run', 'test:e2e'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: {
      ...process.env,
      STRIPE_SECRET_KEY: stripe,
      STRIPE_PRICE_ID: 'price_1UStJ7GRjKD6n9dmqdwh3trU',
      TEST_DATABASE_URL: database,
    },
    stdio: 'inherit',
  });
  child.once('error', () => {
    console.error('Unable to start npm for the private E2E run.');
    process.exitCode = 1;
  });
  child.once('exit', code => { process.exitCode = code ?? 1; });
} catch {
  // Do not print platform errors: they can contain provider credentials.
  console.error('BLOCKED: cannot load HDUX test credentials from THRONE. Check THRONE_PLATFORM_MODULE and the existing HDUX pending environment; no secrets should be pasted into the repo.');
  process.exitCode = 1;
}

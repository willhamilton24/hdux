Template review regression checks

- `npm run typecheck`
- `npx vitest run` (includes the Storybook suite and `templates.test.tsx`)
- `npm run build`
- `npm run build-storybook`
- Start private previews with `npm run storybook -- --host 127.0.0.1 --ci`, then run `node tests/templates.visual.cjs`.

Verified locally: typecheck and both builds passed; 18 test files / 106 tests passed.
The visual script passed all 15 combinations at 1440px, 768px, and 375px:
landing page dark/custom/light, plus the dashboard and lobby's existing dark palette.
Full-page screenshots in `/tmp/hdux-*.png` were inspected for clipping and layout.
The script checks page overflow and axe color contrast; keyboard theme switching and
sorting are also covered by the regression tests.

Checkout tests mock the existing license-service response; they do not initiate a
real Stripe transaction. Storybook-only fixtures use the existing license context
and are not library exports. Production license validation remains unchanged.
No deployment or publication was performed.

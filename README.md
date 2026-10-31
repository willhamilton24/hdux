# HDUX — Hamilton Dynamic User Experience
![Concept](https://img.shields.io/badge/Concept-C-yellow) ![Effort to Cashflow](https://img.shields.io/badge/Effort_to_Cashflow-45%2F100-yellow)


A React component framework for building dynamic, animated user interfaces with a distinctive sci-fi aesthetic.

## Migrating from HDUI-Prototype

**HDUI-Prototype is being archived.** All active development continues here as **HDUX**. If you're using the old package, please migrate:

1. Uninstall the old package: `npm uninstall @hamiltondynamic/hdui-prototype`
2. Install HDUX: `npm install @hamiltondynamic/hdux`
3. Update imports: change `@hamiltondynamic/hdui-prototype` → `@hamiltondynamic/hdux`
4. Review the component API above — most props and variants are compatible, with enhancements

For detailed migration notes or questions, [open an issue](https://github.com/hamiltondynamic/hdux/issues).

## Installation

```bash
npm install @hamiltondynamic/hdux
```

**Peer dependencies:** React 18+

## Quick Start

```tsx
import {
  HduxThemeProvider,
  TopBar, BottomBar, BarLeft, BarRight, BarElement,
  Box, Text, ThemeSelector,
} from "@hamiltondynamic/hdux";

function App() {
  return (
    <HduxThemeProvider>
      <TopBar>
        <BarLeft>
          <BarElement><Text variant="body">MY APP</Text></BarElement>
        </BarLeft>
        <BarRight>
          <BarElement borderless><ThemeSelector /></BarElement>
        </BarRight>
      </TopBar>

      <Box animation="standard" hasLoaded={true} fullBorder>
        <Text variant="h3" animation="print">SYSTEM ONLINE</Text>
        <Text variant="body" animation="sweep">
          All subsystems initialized and operational.
        </Text>
      </Box>

      <BottomBar>
        <BarLeft>
          <BarElement><Text variant="body">v0.1.0</Text></BarElement>
        </BarLeft>
      </BottomBar>
    </HduxThemeProvider>
  );
}
```

## Theme System

HDUX is built around a layered theme system. Wrap your app in `<HduxThemeProvider>` and optionally provide a config with up to 4 theme layers:

- **`light`** / **`dark`** / **`custom`** — color-only mode themes (`mainColor`, `textColor`, `background`, `customColors`)
- **`master`** — includes colors plus structural tokens (`typography`, `borderWidth`, `boxCorners`)

Provide only a `master` to skip light/dark modes, or combine all four for full theme switching. Transitions between modes are smooth — colors fade via CSS custom properties.

```tsx
<HduxThemeProvider config={{
  master: {
    mainColor: "#00d4ff",
    background: "#0a0a1a",
    typography: { mainFont: '"Quantico", sans-serif' },
    borderWidth: "2px",
    boxCorners: { length: "16px", width: "3px" },
  },
  light: { mainColor: "#1a1a2e", background: "#f0f0f0" },
  dark: { mainColor: "#00d4ff", textColor: "#e0e0e0", background: "#0a0a1a" },
  transitionDuration: "400ms",
}}>
```

Use `useTheme()` to access `{ theme, mode, setMode, availableModes }` from any child component.

## Components

### Box

The signature HDUX surface — a container demarcated by 90-degree corner pieces. Oriented around loading-to-reveal animations.

```tsx
<Box
  animation="standard"       // "static" | "standard" | "verticalFirst" | "horizontalFirst"
  hasLoaded={isReady}         // triggers transition to full size
  loadingText="LOADING"       // text shown during loading state
  fullBorder                  // extend corner lines to a full outline after settling
  loadingAnimations={{
    textPulse: { duration: 800 },
    cornerSpin: { duration: 400 },
    cornerBlinkStart: { iterations: 2 },
  }}
>
  {children}
</Box>
```

**Animation modes:**
- `static` — no animation, renders immediately
- `standard` — corners start centered, slide out to final positions
- `verticalFirst` — corners move to top/bottom edges first, then horizontally
- `horizontalFirst` — corners move to left/right edges first, then vertically

**Loading animations:** `textPulse`, `cornerPulse`, `cornerSpin`, `textBlink`, `cornerBlinkStart`, `cornerBlinkEnd`, `contentBlink`

### Text

The default typographical component. If placed inside a `Box`, it automatically sequences its intro animation to play after the Box settles.

```tsx
<Text variant="h2" animation="print" color="#00d4ff">
  SYSTEM STATUS
</Text>
```

**Props:**
- `variant` — `h1`–`h6`, `subheading`, `body` (sets size, weight, and HTML element)
- `animation` — `"none"`, `"print"` (typewriter effect), `"sweep"` (diagonal mask reveal)
- `color`, `fontSize`, `fontFamily` — manual overrides (variant and theme are defaults)

### TopBar & BottomBar

Fixed header and footer bars demarcated by a solid theme-colored border.

```tsx
<TopBar>
  <BarLeft>   {/* aligns content left */}
  <BarCenter> {/* centers content */}
  <BarRight>  {/* aligns content right */}
</TopBar>
```

Each bar accepts up to 3 children: `BarLeft`, `BarCenter`, `BarRight` (each used at most once). Pass `static` prop to disable fixed positioning.

### BarElement

The basic UI unit for bars — transparent background with side borders in the theme color. Borders span the full height of the bar.

```tsx
<BarElement onClick={handleClick}>
  <Text variant="body">DASHBOARD</Text>
</BarElement>

<BarElement borderless>  {/* no side borders */}
<BarElement color="#ff6f00" background="#1a0a00">  {/* custom colors */}
```

### ThemeSelector

A three-position theme mode switcher rendered as a pseudo-triangle with gap-cut corners. The active mode is indicated by a filled triangle at the corresponding corner. Clicking cycles through available modes.

```tsx
<BarElement borderless>
  <ThemeSelector size={36} />
</BarElement>
```

Corner mapping: top = custom, bottom-left = light, bottom-right = dark.

### Input

A text field with HDUX corner decorations. Fully controlled; supports labels, focus highlight, and disabled/read-only states.

```tsx
<Input
  label="Operator ID"
  placeholder="ENTER CALLSIGN"
  value={val}
  onChange={(e) => setVal(e.target.value)}
  color="#00d4ff"   // optional accent override
/>
```

### Select, Checkbox, and TextArea

These native controls share `Input`'s corner styling, `color`, `cornerLength`, `cornerWidth`, labels, and helper/error text. Refs point to the native element for focus and validation. `errorText` takes precedence over `helperText` and sets `aria-invalid`; descriptions are linked with `aria-describedby` (including any caller-supplied description IDs). `className` and `style` apply to the wrapper.

```tsx
import { Select, Checkbox, TextArea } from "@hamiltondynamic/hdux";

<Select label="Plan" name="plan" defaultValue="" required helperText="Choose your purchase plan.">
  <option value="">Choose a plan</option>
  <option value="starter">Starter</option>
  <option value="pro">Pro</option>
</Select>
<Checkbox label="Send order updates" name="updates" defaultChecked />
<TextArea label="Delivery instructions" name="notes" rows={4} maxLength={500} />
```

Use `value`/`onChange` for controlled selects and text areas, and `checked`/`onChange` for controlled checkboxes. Native attributes such as `disabled`, `required`, `multiple` (Select), and `readOnly` (TextArea) are supported. Provide `aria-label` when omitting a visible label.

### Table

A themed data table. Pass typed column definitions and row data; each column can include a custom `render` function.

```tsx
<Table
  columns={[
    { key: "id", header: "ID", width: 80 },
    { key: "name", header: "Agent" },
    {
      key: "status",
      header: "Status",
      render: (val) => <span style={{ color: statusColor(val) }}>{val}</span>,
    },
  ]}
  rows={agents}
  onRowClick={(row) => console.log(row)}
  striped
/>
```

### Modal

An animated overlay dialog using a React portal. Accepts `title`, close-on-backdrop, Escape-key dismiss, and body-scroll lock.

```tsx
<Modal open={open} onClose={() => setOpen(false)} title="Confirm Action">
  <Text variant="body">Reconfigure the relay?</Text>
  <Button onClick={() => setOpen(false)}>CONFIRM</Button>
</Modal>
```

### StatBar

A HUD-style horizontal progress bar with label, optional value readout, tick marks, and an animated fill that eases to its target value.

```tsx
<StatBar label="Hull Integrity" value={72} showValue="percent" />
<StatBar label="Ammo" value={14} max={50} color="#ff6f00" showValue />
```

### RadialMeter

A circular gauge (SVG arc, 240° sweep) for single metrics. The fill transitions smoothly when `value` changes.

```tsx
<RadialMeter value={72} label="POWER" size={120} />
<RadialMeter value={temp} max={200} label="CORE TEMP" formatValue={(v) => `${v}°`} />
```

## Default Font

HDUX uses [Quantico](https://fonts.google.com/specimen/Quantico) as the default framework font. The `HduxThemeProvider` automatically loads it from Google Fonts. Override via the `typography.mainFont` theme config.

## Development

```bash
npm run storybook       # dev server on port 6006
npm run build           # library build (CJS + ESM + types)
npm run build-storybook # static Storybook build
npm run typecheck       # TypeScript checking
```

## HDUX Pro

Advanced widgets and full-page templates for power users, sold as a one-time license.

```bash
npm install @hamiltondynamic/hdux
```

```tsx
import { HduxProProvider, AreaChart, DataGrid, GaugeCluster } from "@hamiltondynamic/hdux/pro";

function App() {
  return (
    <HduxProProvider licenseKey="HDUX-PRO-XXXX-XXXX-XXXX-XXXX">
      <AreaChart data={[12, 28, 45, 38, 60]} title="THROUGHPUT" />
      <GaugeCluster
        gauges={[
          { label: "CPU", value: 68 },
          { label: "MEM", value: 82 },
        ]}
      />
      <DataGrid columns={columns} rows={rows} searchable />
    </HduxProProvider>
  );
}
```

### Pro Components

| Component | Description |
|-----------|-------------|
| `AreaChart` | Animated SVG area/line chart with multi-series support and HUD aesthetic |
| `DataGrid` | Sortable, filterable, paginated data table |
| `GaugeCluster` | Grid of `RadialMeter` gauges with cluster health bar |

### Pro Templates

| Template | Description |
|----------|-------------|
| `OpsDashboard` | Full-page operational dashboard (live demo gauges + charts + service map + event log with alert indicator) |
| `GameLobby` | Game lobby with team view, MMR display, measured ping bars, ready state, and countdown |
| `LandingPage` | Full marketing page — live component showcases, customizable branding, pricing, and shared Pro checkout |

### Purchasing a License

Public purchasing is not active. The service implements `GET /v1/checkout/session`
(browser navigation with a 303 redirect) and `POST /v1/checkout/session`
(JSON `{ "url": "…" }`) for the provisioned Pro price. The Pro gate accepts a
`checkoutUrl` on `HduxProProvider`; derive it from the host application's configured
`SERVICE_URL`. Without configuration, no purchase link is displayed. Browser links
use GET; server or same-origin integrations may POST, check the response status and
hosted Stripe URL, then navigate to it. No cross-origin fetch setup is required for GET.

### License Key

Pass `validationUrl` on `HduxProProvider`, derived from `SERVICE_URL` plus
`/v1/license/validate`. Validation fails closed if unconfigured or unreachable.

## Support HDUX

Optional support is implemented separately from Pro licensing using the company's
shared Stripe account **in test mode only**. `GET /v1/support/checkout` opens a
hosted Checkout for a fixed, one-time **$5 USD contribution**, with no Pro license
or other entitlement. `POST /v1/support/checkout` returns a checkout URL for
same-origin integrations. Support sessions carry `hdux-support` metadata; the
license webhook only issues keys for paid test sessions marked `hdux-pro` with
the Pro price. The contribution uses inline Stripe price data, so no additional
account or provisioned price is required.

Configure the service privately with `STRIPE_SECRET_KEY` (`sk_test_` only),
`STRIPE_PRICE_ID` (Pro), `SERVICE_URL` (service origin), and optionally `APP_URL`
(application return URL, defaults to `SERVICE_URL`). URLs must use HTTPS, except
loopback HTTP for local checks. Checkout accepts only an optional email and
`success_url`/`cancel_url` on these configured origins; amounts and prices cannot
be supplied by clients. `DATABASE_URL` and `STRIPE_WEBHOOK_SECRET` remain required
for license issuance; SMTP configuration and `EMAIL_FROM` enable email delivery.

There is no assigned public domain or active support destination. Funding metadata
is omitted until public activation is authorized and verified. Do not publish
checkout links, deploy services, register public webhooks, or enable publication
while the deployment switch is OFF. `render.yaml` disables automatic deployment;
the Pages deployment and npm publishing jobs are explicitly disabled. Local code
and mocked tests are complete; real test-payment verification and any public
activation remain pending. Hosted redirects follow the
[Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions).

## License

MIT

## 💰 Path to Revenue
Open-core npm library: free base components drive adoption, paid "pro" pack (data-viz HUD widgets, dashboards, game-UI templates) sold with license keys. Optional voluntary support uses a company-owned Stripe test Payment Link, separate from Pro checkout and licensing.

### Funding
- **Primary:** HDUX Pro — one-time license for advanced widgets and templates
- **Secondary:** Optional Stripe test-mode support (configuration below); no Pro license is granted.

### Release TODOs
- [x] Make `Modal` safe for keyboard workflows: trap Tab/Shift+Tab inside the open dialog, restore focus to its trigger on close, and verify Escape dismissal and focus restoration in local browser tests so adopters can use it for purchase and settings dialogs.
- [x] Add form-validation support to `Input`: forward refs and native validation/autocomplete attributes, expose helper/error text linked with `aria-describedby` and `aria-invalid`, and demonstrate required/email validation and focus-on-error in Storybook so customer forms need no replacement controls.
- [x] Respect `prefers-reduced-motion` in Box and Text animation logic as well as CSS: bypass decorative blinking, traversal, and typewriter timers while preserving loading state and revealing ready content; verify initial preference and preference changes in local browser tests to make templates usable by motion-sensitive customers.
- [x] Add explicit loading, error/retry, empty-data, and no-filter-match states to Pro `DataGrid`, with accessible status feedback and configurable messages; cover each state with local fixtures and stories so paid dashboards do not show misleading "NO RESULTS" while fetching or after failures.
- [ ] Make clickable `Table` rows keyboard-accessible: when `onRowClick` is provided, make each row focusable with a visible focus style, activate on Enter/Space, and expose appropriate ARIA semantics; verify with keyboard-only interaction tests so adopters can ship accessible master-detail screens on the free tier.
- [x] Complete the form-control set with themed `Select`, `Checkbox`, and `TextArea` components matching `Input`'s corner styling, ref forwarding, and validation pattern (`aria-describedby`/`aria-invalid`, helper/error text), each with Storybook stories, so customers can build entire purchase and settings forms without mixing in unstyled native controls.
- [ ] Bring Pro `AreaChart` up to the `DataGrid` state standard: render explicit loading and empty-data states instead of a blank or degenerate plot for empty/single-point series, and expose the underlying values to screen readers (visually hidden data table or ARIA description) rather than a bare `role="img"` label; cover with fixtures and stories.
- [ ] Add an SSR smoke test that `renderToString`s the core and Pro exports (ThemeProvider, Box/Text, templates) without touching browser globals, wired into the local test run, and fix anything it surfaces — server rendering under Next.js is the primary adoption path for a paid React component library.
- [ ] Public npm/Storybook activation — disabled pending operator authorization
- [x] Expand the component set beyond Box/Text/Bars — inputs, tables, modals, and HUD-style charts are what paying users need
- [x] Create a paid Pro tier (advanced widgets + templates) gated by license key, sold via the shared Stripe + license-service stack (Stripe product/price provisioned)
- [x] Implement the private license service and Render configuration; public deployment remains pending
- [x] Close the free-Pro hole: `src/pro/validateLicense.ts` accepts any well-formed key when the service is unreachable — fail closed (or use signed offline keys) once the license service exists
- [x] Implement Pro checkout and configurable gate navigation, with webhook license issuance and optional email delivery; public activation remains pending
- [x] Run a Stripe test-mode E2E check: checkout → webhook → key issued → `validateLicense` accepts the key and rejects a revoked one
- [x] Build 2-3 polished full-page demo templates (ops dashboard, game lobby, landing page) as the visual sales pitch
- [x] Add optional, explicitly configured Stripe test Payment Link support; hide it without configuration and distinguish it from Pro licensing
- [x] Implement separate optional Stripe test-mode support checkout and configuration documentation
- [ ] Verify a completed support test payment; activate a public support destination and funding metadata only after the operator enables deployment
- [ ] Launch posts with animation GIFs on r/reactjs, Hacker News, and X; submit to component-library directories (waits on the deployment switch)
- [ ] Archive HDUI-Prototype with a pointer here so traffic consolidates on one repo (migration docs drafted; archiving the public repo and pointing its traffic here waits on the deployment switch)

### Private license E2E verification

The previous test created an unpaid session and signed a fabricated completion event.
That was synthetic webhook integration coverage, not evidence of completed checkout.
The completion item above is checked on the strength of the completed run recorded below.

Run `npm run test:e2e` in `license-service` with `STRIPE_SECRET_KEY` (only `sk_test_`),
`STRIPE_PRICE_ID`, and an explicitly selected `TEST_DATABASE_URL` supplied privately.
The database role must be able to create/drop schemas. The harness creates a unique
schema with no public search-path fallback for both the service and test pools, then
drops it (including all test rows) on exit. It never uses `DATABASE_URL` as a fallback.
Missing configuration fails with `BLOCKED`, rather than passing a skipped test.

On the THRONE operator machine, the already provisioned credentials can be loaded
without copying secrets into the shell or repository:

```sh
cd license-service
npm run test:e2e:platform
```

This helper uses THRONE's repo-aware `secretsFor('hdux')` and the existing HDUX
pending environment. It defaults to the platform module at
`~/Desktop/Workspace/throne/dist/platform.js`; set `THRONE_PLATFORM_MODULE` to its
absolute path if THRONE is installed elsewhere. It requires the stored test key
and database URL and passes only the required provider credentials to the test
process. It does not provision or deploy anything.

When the harness prints the private `checkout-url.txt` path, open the URL in that
file in the browser (on macOS: `open "$(cat <printed-path>)"`) and complete the
sandbox checkout within 180 seconds. Only the operator enters test payment
details. After a successful run, add the sanitized success record described below
and check the E2E Release TODO; a timeout is not success.

The harness calls the application's POST checkout route with loopback redirects and
writes the hosted test Checkout URL to a temporary private file. An operator must
complete that test checkout within 180 seconds; no agent enters payment details.
It polls Stripe for the paid, completed session and the matching actual completion
event, re-signs that unchanged event for local delivery, correlates the issued key,
and calls the real validator before and after revocation. No public endpoint or
webhook registration is used. This verifies local event handling, not public Stripe
webhook transport. SMTP is disabled during the run. Temporary files, pools, server,
schema and environment overrides are cleaned up even on partial setup failure;
open Stripe test sessions are expired. Completed test payments/events remain in
Stripe's test-mode history.

Sanitized run records include the revision, command, UTC timestamp, test result, and
the harness's final correlation summary, with no credentials, Checkout URLs, customer
details, or license keys. Public deployment/delivery verification remains disabled by
project policy.

Review-fix checks (2026-10-22): root build/typecheck, license-service build, and
standalone strict typechecking of the E2E test passed. Missing-config and non-test
credential probes failed explicitly as intended. The normal E2E command was
BLOCKED by missing local configuration; checkout, database isolation and key
issuance have not been verified against the provisioned services in this run.
A failed database-connection probe also exited promptly without a server-close hang.

Recheck (2026-10-24): root `npm run typecheck` and `npm run build`, license-service
`npm run build`, and `npm run test:e2e` with no credentials all still pass / BLOCK
as expected after the support payment link additions. No code changes required.

Private verification attempt (2026-10-24, started 08:44:18 UTC), revision
`f2041c2fe7a7ca68af9eb59205a755ce33682db3`: ran `npm run test:e2e` using the
existing THRONE test credentials supplied in memory. Neon schema creation and
service migrations succeeded; the app created a real HDUX Pro test Checkout
session. Stripe confirmed it was open, unpaid, and non-live. Browser inspection
confirmed the sandbox checkout loaded, priced at USD 49, but required payment
details and offered no built-in completion action without them. The operator's
no-agent-payment-details restriction prevented completion. Result: **BLOCKED**
after the 180-second checkout window (183.19-second test duration), with no
cleanup errors. No paid completion event, issued key, or validator/revocation
correlation was observed; the Release TODO remains unchecked. No public endpoint,
deployment, or webhook registration was created.

The platform launcher passed a credential-presence/command/directory smoke check
without printing credential values; a missing platform module failed explicitly.
All 19 checkout tests and the license-service TypeScript build passed.

Private verification run (2026-10-24, started 08:58:14 UTC), revision
`2c03de4c290f5ebdd22978d78c2cf2400b3f182d`: the operator ran
`npm run test:e2e:platform` and completed the sandbox checkout with a Stripe test
card in the browser (no agent entered payment details). Result: **PASSED**
(1/1 test, 100.17-second test duration, exit 0, no cleanup errors; the private
checkout file was removed). Harness summary: "Verified: app checkout,
Stripe-confirmed paid test session, matching real event replayed on loopback,
correlated key, validator accepted then rejected after revocation." SMTP was
disabled, so no license email was sent. No public endpoint, deployment, or webhook
registration was created.

### Template review checks

Run `npm run typecheck`, `npx vitest run --config vitest.templates.config.ts`,
`npx vitest run`, `npm run build`, and `npm run build-storybook` locally.
The template regression suite runs Chromium at 320px and 375px, checks prop
updates, empty rosters, checkout failures, and local license validation.
Template Storybook stories use `.storybook/proFixture.ts` to mock only a local
validation URL; production license checks are unchanged. Landing-page story CTAs
are local callbacks and do not start checkout.

`OpsDashboard` uses supplied data directly; set `demoMode` to show sample data
for omitted props. Service totals derive from `serviceNodes`. `LobbyPlayer`
accepts numeric `pingMs` and `mmr`; display `stat` strings are never parsed.
`LandingPage.onCtaClick` must call the host application's configured checkout
integration (using its environment-backed service URL), validate HTTP status and
response before redirecting, and reject on failure. The template awaits that
callback, prevents duplicate submissions, and displays accessible failure feedback.
It has no built-in checkout endpoint.


### Optional Stripe support (test mode only)

Set the host application's `NEXT_PUBLIC_STRIPE_SUPPORT_PAYMENT_LINK` to a test-mode
Payment Link from the existing company Stripe account, then pass it explicitly:

```tsx
<HduxProProvider
  licenseKey={licenseKey}
  supportPaymentLink={process.env.NEXT_PUBLIC_STRIPE_SUPPORT_PAYMENT_LINK}
>
  <App />
</HduxProProvider>
```

The library does not read environment variables itself. Without this prop (or with
an invalid or live-mode URL), the entire support section is absent from ProGate
and LandingPage. Only `https://buy.stripe.com/test_…` links without query parameters
are accepted. No destination is bundled by default.

Configure the company's test Payment Link with a **separate support product and
price**, never the Pro price, and session metadata `product=hdux-support`.
Use Stripe's hosted thank-you confirmation, not the license success route.
The webhook ignores support-marked sessions and otherwise still requires the Pro
price to issue a license. Support opens the configured Payment Link directly;
it never calls Pro checkout, changes license status, or grants a Pro license.
Existing ProGate purchase and LandingPage `onCtaClick` behavior is unchanged.

No Payment Link was created or published by this change. The operator must supply
company-owned test configuration before support appears. No new endpoint, secret,
or deployment is required by this integration; deployment remains off.


Support review verification (2026-10-24):

- [x] Root `npm run typecheck` and `npm run build`; license-service `npm run build`.
- [x] Browser suite: `npx vitest run --config vitest.templates.config.ts` (10 tests),
  including absent/invalid/present support configuration, removal on configuration
  change, independent Pro actions, and keyboard Tab/Enter with visible focus.
- [x] Desktop (1280px) and narrow mobile (320px) support layout bounds and screenshot review.
- [x] License-service `npx vitest run src/support.test.ts` and strict test typecheck:
  support does not issue keys or emails; Pro checkout still uses the existing price
  and paid Pro webhook events still issue licenses (Stripe/database mocked locally).
- [ ] Operator-supplied company Stripe test Payment Link and completed test payment:
  not performed in this review; support remains hidden without configuration.

`render.yaml` already exists and requires no change for this host-provided optional
Payment Link. No deployment, publication, public webhook, or account creation was performed.

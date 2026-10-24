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

**[Buy HDUX Pro →](https://api.hdux.dev/v1/checkout/session)** — opens a Stripe Checkout page. Your license key is emailed to you after payment and shown on the confirmation page. Pro components without a provider also display an inline "Buy HDUX Pro →" button that goes directly to checkout.

### License Key

Wrap your app (or any subtree) in `<HduxProProvider licenseKey="…">`. The key is validated once on mount against `https://api.hdux.dev/v1/license/validate`. If the service is unreachable, any well-formed key (`HDUX-PRO-XXXX-XXXX-XXXX-XXXX`) is accepted as a fallback. Pro components without a valid provider show a gate overlay instead of the component.

## License

MIT

## 💰 Path to Revenue
Open-core npm library: free base components drive adoption, paid "pro" pack (data-viz HUD widgets, dashboards, game-UI templates) sold with license keys.

### Release TODOs
- [x] Publish v0.1 to npm and deploy the Storybook (GitHub Action already exists) as a public docs/demo site
- [x] Expand the component set beyond Box/Text/Bars — inputs, tables, modals, and HUD-style charts are what paying users need
- [x] Create a paid Pro tier (advanced widgets + templates) gated by license key, sold via the shared Stripe + license-service stack (Stripe product/price provisioned)
- [x] Stand up the license service (`api.hdux.dev/v1/license/validate` has no backend): a small web service + `render.yaml` that issues keys from the Stripe checkout webhook and validates them on request
- [x] Close the free-Pro hole: `src/pro/validateLicense.ts` accepts any well-formed key when the service is unreachable — fail closed (or use signed offline keys) once the license service exists
- [x] Add a "Buy HDUX Pro" checkout path (Stripe Checkout session against the provisioned price) linked from README and the Pro gate overlay, delivering the license key by email
- [ ] Run a Stripe test-mode E2E check: checkout → webhook → key issued → `validateLicense` accepts the key and rejects a revoked one
- [x] Build 2-3 polished full-page demo templates (ops dashboard, game lobby, landing page) as the visual sales pitch
- [ ] Add GitHub Sponsors/Polar funding links as a secondary revenue channel
- [ ] Launch posts with animation GIFs on r/reactjs, Hacker News, and X; submit to component-library directories (waits on the deployment switch)
- [ ] Archive HDUI-Prototype with a pointer here so traffic consolidates on one repo (migration docs drafted; archiving the public repo and pointing its traffic here waits on the deployment switch)

### Private license E2E verification

The previous test created an unpaid session and signed a fabricated completion event.
That was synthetic webhook integration coverage, not evidence of completed checkout.
The completion item above remains unchecked until a reproducible completed run exists.

Run `npm run test:e2e` in `license-service` with `STRIPE_SECRET_KEY` (only `sk_test_`),
`STRIPE_PRICE_ID`, and an explicitly selected `TEST_DATABASE_URL` supplied privately.
The database role must be able to create/drop schemas. The harness creates a unique
schema with no public search-path fallback for both the service and test pools, then
drops it (including all test rows) on exit. It never uses `DATABASE_URL` as a fallback.
Missing configuration fails with `BLOCKED`, rather than passing a skipped test.

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

No completed checkout evidence is recorded yet. A future sanitized run record should
include the revision, command, UTC timestamp, test result, and the harness's final
correlation summary, with no credentials, Checkout URLs, customer details, or license
keys. Public deployment/delivery verification remains disabled by project policy.

Review-fix checks (2026-10-22): root build/typecheck, license-service build, and\nstandalone strict typechecking of the E2E test passed. Missing-config and non-test\ncredential probes failed explicitly as intended. The normal E2E command was\nBLOCKED by missing local configuration; checkout, database isolation and key\nissuance have not been verified against the provisioned services in this run.\nA failed database-connection probe also exited promptly without a server-close hang.\nEOF

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

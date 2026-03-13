# HDUX — Hamilton Dynamic User Experience

A React component framework for building dynamic, animated user interfaces with a distinctive sci-fi aesthetic.

## Installation

```bash
npm install hdux
```

**Peer dependencies:** React 18+

## Quick Start

```tsx
import {
  HduxThemeProvider,
  TopBar, BottomBar, BarLeft, BarRight, BarElement,
  Box, Text, ThemeSelector,
} from "hdux";

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

## Default Font

HDUX uses [Quantico](https://fonts.google.com/specimen/Quantico) as the default framework font. The `HduxThemeProvider` automatically loads it from Google Fonts. Override via the `typography.mainFont` theme config.

## Development

```bash
npm run storybook       # dev server on port 6006
npm run build           # library build (CJS + ESM + types)
npm run build-storybook # static Storybook build
npm run typecheck       # TypeScript checking
```

## License

MIT

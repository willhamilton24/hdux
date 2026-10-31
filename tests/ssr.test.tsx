// SSR smoke: verify core and Pro exports renderToString without touching browser
// globals. Runs in Node.js (no window/document) — the primary Next.js adoption path.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  HduxThemeProvider,
  Box,
  Text,
  Button,
  TopBar,
  BottomBar,
  Navbar,
  BarLeft,
  BarRight,
  BarCenter,
  BarElement,
  BarButton,
  Input,
  Table,
  Modal,
  StatBar,
  RadialMeter,
} from '../src/index';
import {
  AreaChart,
  DataGrid,
  GaugeCluster,
  OpsDashboard,
  GameLobby,
  LandingPage,
} from '../src/pro/index';
import { HduxProContext } from '../src/pro/ProContext';

function licensed(element: React.ReactNode) {
  return (
    <HduxProContext.Provider value={{ status: 'valid', licenseKey: 'HDUX-PRO-TEST-0000-0000-0000' }}>
      {element}
    </HduxProContext.Provider>
  );
}

describe('SSR smoke', () => {
  it('renders ThemeProvider, Box, Text, Button', () => {
    const html = renderToString(
      <HduxThemeProvider>
        <Box>
          <Text>Hello</Text>
          <Button>Click me</Button>
        </Box>
      </HduxThemeProvider>
    );
    expect(html).toContain('Hello');
    expect(html).toContain('Click me');
  });

  it('renders navigation components', () => {
    const html = renderToString(
      <HduxThemeProvider>
        <TopBar>
          <BarLeft><BarElement>Logo</BarElement></BarLeft>
          <BarRight><BarButton>Menu</BarButton></BarRight>
        </TopBar>
        <Navbar items={[{ label: 'Home', href: '/' }]} />
        <BottomBar>
          <BarCenter><BarElement>Footer</BarElement></BarCenter>
        </BottomBar>
      </HduxThemeProvider>
    );
    expect(html).toContain('Logo');
    expect(html).toContain('Footer');
  });

  it('renders Input and Table', () => {
    const html = renderToString(
      <HduxThemeProvider>
        <Input placeholder="Search…" />
        <Table
          columns={[{ key: 'name', header: 'Name' }]}
          rows={[{ name: 'Alice' }]}
        />
      </HduxThemeProvider>
    );
    expect(html).toContain('Search');
    expect(html).toContain('Alice');
  });

  it('renders Modal with open=false', () => {
    const html = renderToString(
      <HduxThemeProvider>
        <Modal open={false} title="Hidden">content</Modal>
      </HduxThemeProvider>
    );
    expect(html).not.toContain('Hidden');
  });

  it('renders Modal with open=true (SSR fix: no document.body access)', () => {
    const html = renderToString(
      <HduxThemeProvider>
        <Modal open title="Confirm">Are you sure?</Modal>
      </HduxThemeProvider>
    );
    expect(html).toContain('Confirm');
    expect(html).toContain('Are you sure?');
  });

  it('renders StatBar and RadialMeter', () => {
    const html = renderToString(
      <HduxThemeProvider>
        <StatBar value={42} max={100} label="CPU" />
        <RadialMeter value={75} max={100} label="Memory" />
      </HduxThemeProvider>
    );
    expect(html).toContain('CPU');
    expect(html).toContain('Memory');
  });

  it('renders Pro AreaChart', () => {
    const html = renderToString(
      <HduxThemeProvider>
        {licensed(<AreaChart series={[{ label: 'Requests', data: [10, 20, 30] }]} />)}
      </HduxThemeProvider>
    );
    expect(html).toContain('hdux-area-chart');
  });

  it('renders Pro DataGrid', () => {
    const html = renderToString(
      <HduxThemeProvider>
        {licensed(
          <DataGrid
            columns={[{ key: 'id', header: 'ID' }, { key: 'name', header: 'Name' }]}
            rows={[{ id: 1, name: 'Row 1' }]}
          />
        )}
      </HduxThemeProvider>
    );
    expect(html).toContain('Row 1');
  });

  it('renders Pro GaugeCluster', () => {
    const html = renderToString(
      <HduxThemeProvider>
        {licensed(<GaugeCluster gauges={[{ label: 'Latency', value: 50, max: 100 }]} />)}
      </HduxThemeProvider>
    );
    expect(html).toContain('Latency');
  });

  it('renders OpsDashboard template', () => {
    const html = renderToString(
      <HduxThemeProvider>
        {licensed(<OpsDashboard demoMode />)}
      </HduxThemeProvider>
    );
    expect(html).toContain('hdux-ops-dashboard');
  });

  it('renders GameLobby template', () => {
    const html = renderToString(
      <HduxThemeProvider>
        {licensed(<GameLobby />)}
      </HduxThemeProvider>
    );
    expect(html).toContain('hdux-game-lobby');
  });

  it('renders LandingPage template', () => {
    const html = renderToString(
      <HduxThemeProvider>
        {licensed(<LandingPage />)}
      </HduxThemeProvider>
    );
    expect(html).toContain('hdux-landing');
  });
});

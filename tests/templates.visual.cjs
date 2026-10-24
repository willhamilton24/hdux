// Start loopback Storybook first: npm run storybook -- --host 127.0.0.1 --ci
// Run: node tests/templates.visual.cjs. Screenshots stay in /tmp.
const { chromium } = require('playwright');

async function verifyTemplates() {
  const browser = await chromium.launch();
  const failures = [];
  try {
    const page = await browser.newPage();
    for (const name of ['landingpage', 'opsdashboard', 'gamelobby']) {
      for (const width of [1440, 768, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=hdux-pro-templates-${name}--default&viewMode=story`);
        await page.waitForTimeout(3500); // Allow the template entrance animations to finish.
        // Dashboard and lobby currently supply only their dark palette.
        const modes = name === 'landingpage' ? ['dark', 'custom', 'light'] : ['dark'];
        for (const expectedMode of modes) {
          const theme = await page.locator('[data-hdux-theme]').first().getAttribute('data-hdux-theme');
          if (theme !== expectedMode) throw new Error(`Expected ${expectedMode}, received ${theme}`);
          await page.screenshot({ path: `/tmp/hdux-${name}-${width}-${theme}.png`, fullPage: true });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
          await page.addScriptTag({ path: require.resolve('axe-core') });
          const contrast = await page.evaluate(async () => {
            const results = await axe.run(document.querySelector('#storybook-root'), { runOnly: ['color-contrast'] });
            return results.violations.map(violation => ({
              id: violation.id,
              nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
            }));
          });
          console.log(JSON.stringify({ name, width, theme, overflow, contrast }));
          if (overflow || contrast.length) failures.push(`${name} ${width} ${theme}`);
          if (name === 'landingpage') {
            await page.locator('.hdux-theme-selector').first().focus();
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  if (failures.length) throw new Error(`Visual checks failed: ${failures.join(', ')}`);
}

verifyTemplates().catch(error => { console.error(error); process.exitCode = 1; });

import { expect, test } from '@playwright/test';

test('home layout protects full-body art, touch targets and readable mobile instructions', async ({ page }, info) => {
  await page.goto('/');
  const es = info.project.metadata.language === 'es-MX';
  if (es) await page.getByRole('button', { name: 'Cambiar a español de México' }).click();
  const title = es ? 'Casa Robot' : 'Robot Home';
  await page.locator('.fw-destination-grid > .fw-destination').filter({ has: page.getByText(title, { exact: true }) }).click();
  const home = page.locator('.living-home');
  await expect(home).toBeVisible();
  await expect(page.locator('[data-home-direction="right"]')).toBeVisible();
  const metrics = await home.evaluate(element => {
    const bar = element.querySelector('.living-home__command-bar')!;
    const message = bar.querySelector('p')!.getBoundingClientRect();
    const pad = bar.querySelector('.living-home__dpad')!.getBoundingClientRect();
    const buttons = [...bar.querySelectorAll('button')].map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }));
    const art = element.querySelector('.living-home__actor--nico .nico-canonical-sprite')!;
    const bounds = art.getBoundingClientRect();
    return {
      width: element.getBoundingClientRect().width,
      available: element.parentElement!.getBoundingClientRect().width,
      mobile: matchMedia('(max-width: 600px)').matches,
      barWidth: bar.getBoundingClientRect().width,
      messageWidth: message.width,
      messageBottom: message.bottom,
      padTop: pad.top,
      display: getComputedStyle(bar).display,
      artRatio: bounds.width / bounds.height,
      transform: getComputedStyle(art).transform,
      buttons,
    };
  });
  expect(metrics.width).toBeGreaterThanOrEqual(Math.min(metrics.available, 1150) - 3);
  expect(metrics.transform).toBe('none');
  expect(metrics.artRatio).toBeCloseTo(.75, 1);
  for (const button of metrics.buttons) {
    expect(button.width).toBeGreaterThanOrEqual(43.9);
    expect(button.height).toBeGreaterThanOrEqual(43.9);
  }
  if (metrics.mobile) {
    expect(metrics.display).toBe('grid');
    expect(metrics.messageWidth).toBeGreaterThan(metrics.barWidth * .8);
    expect(metrics.messageBottom).toBeLessThanOrEqual(metrics.padTop + 1);
  }
  await page.locator('.living-home__command-bar').evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await info.attach('home-layout-and-controls', { body: await page.screenshot(), contentType: 'image/png' });
});

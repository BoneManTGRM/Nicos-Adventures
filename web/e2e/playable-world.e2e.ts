import { expect, test, type Page, type TestInfo } from '@playwright/test';
async function open(page: Page, info: TestInfo, section: 'home' | 'arcade') {
  await page.goto('/');
  const es = info.project.metadata.language === 'es-MX';
  if (es) await page.getByRole('button', { name: 'Cambiar a español de México' }).click();
  const title = section === 'home' ? (es ? 'Casa Robot' : 'Robot Home') : (es ? 'Sala de juegos' : 'Game Arcade');
  await page.locator('.fw-destination-grid > .fw-destination').filter({ has: page.getByText(title, { exact: true }) }).click();
  return es;
}
async function screenshot(page: Page, info: TestInfo, name: string) {
  await info.attach(name, { body: await page.screenshot({ fullPage: false }), contentType: 'image/png' });
}
async function noOverflow(page: Page) {
  const result = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(result.scroll).toBeLessThanOrEqual(result.width + 2);
}
test('Nico TV keeps readable copy separate from the video at actual card widths', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('.nico-video-card')).toBeVisible();
  if (info.project.name.includes('desktop')) await page.setViewportSize({ width: 1024, height: 900 });
  await page.locator('.nico-video-card').scrollIntoViewIfNeeded();
  const measure = await page.locator('.nico-video-card').evaluate(card => {
    const copy = card.querySelector('.nico-video-card__copy')!.getBoundingClientRect();
    const video = card.querySelector('.nico-video-card__frame')!.getBoundingClientRect();
    const outer = card.getBoundingClientRect();
    return { separate: copy.right <= video.left + 1 || video.right <= copy.left + 1 || copy.bottom <= video.top + 1 || video.bottom <= copy.top + 1,
      copyWidth: copy.width, contained: copy.left >= outer.left && copy.right <= outer.right && video.left >= outer.left && video.right <= outer.right };
  });
  expect(measure.separate).toBe(true); expect(measure.contained).toBe(true); expect(measure.copyWidth).toBeGreaterThan(175);
  await expect(page.locator('.nico-video-card__play')).toBeEnabled({ timeout: 30000 });
  await page.locator('.nico-video-card__play').click();
  await expect.poll(() => page.locator('.nico-video-card video').evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  await noOverflow(page); await screenshot(page, info, 'nico-tv-responsive');
});
test('Nico TV exposes recovery when a video part fails', async ({ page }) => {
  await page.route('**/nico-basketball.part01.b64*', route => route.fulfill({ status: 503, body: '' }));
  await page.goto('/');
  await expect(page.locator('.nico-video-card__error')).toBeVisible();
  await page.unroute('**/nico-basketball.part01.b64*');
  await page.locator('.nico-video-card__error button').click();
  await expect(page.locator('.nico-video-card__play')).toBeEnabled({ timeout: 30000 });
});
test('home characters walk, interact, retain rewards and never use the old nested preview', async ({ page }, info) => {
  await open(page, info, 'home');
  const room = page.locator('.living-home__room');
  await expect(room).toBeVisible(); await expect(page.locator('.living-home .robot-readout')).toHaveCount(0);
  await page.locator('[data-home-select="robot"]').click();
  const start = Number(await room.getAttribute('data-home-x'));
  if (info.project.use.isMobile) {
    const right = page.locator('[data-home-direction="right"]'); const box = await right.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2); await page.mouse.down(); await page.waitForTimeout(550); await page.mouse.up();
  } else { await room.focus(); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(550); await page.keyboard.up('ArrowRight'); }
  await expect.poll(async () => Number(await room.getAttribute('data-home-x'))).toBeGreaterThan(start + 4);
  await page.locator('[data-home-activity="dance"]').click();
  await expect(room).toHaveAttribute('data-home-action', 'dance', { timeout: 15000 });
  await expect(page.locator('[data-home-activity="dance"] small')).toHaveText('✓');
  await page.locator('.living-home__room').scrollIntoViewIfNeeded(); await screenshot(page, info, 'living-home-dance');
  await page.locator('[data-home-select="nico"]').click(); await page.locator('[data-home-activity="repair"]').click();
  await expect(room).toHaveAttribute('data-home-action', 'repair', { timeout: 15000 });
  await page.reload(); await expect(page.locator('[data-home-activity="dance"] small')).toHaveText('✓');
  await expect(page.locator('[data-home-activity="repair"] small')).toHaveText('✓');
  await noOverflow(page);
});
test('3D arena responds to movement and fire, freezes on pause and resets cleanly', async ({ page, browserName }, info) => {
  const es = await open(page, info, 'arcade');
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.getByTestId('open-star-tag').click();
  // Linux WebKit does not always expose WebGL; it must fail visibly and leave navigation usable.
  if (browserName === 'webkit') {
    const ready = await page.getByTestId('tag-start').isEnabled({ timeout: 20000 }).catch(() => false);
    if (!ready) {
      await expect(page.locator('.star-tag [role="alert"]')).toBeVisible({ timeout: 30000 });
      await screenshot(page, info, 'webkit-3d-capability-fallback');
      await page.locator('.star-tag__toolbar button').first().click(); await expect(page.getByTestId('open-star-tag')).toBeVisible(); return;
    }
  }
  await expect(page.getByTestId('tag-start')).toBeEnabled({ timeout: 30000 });
  await page.getByTestId('tag-start').click();
  const game = page.locator('.star-tag'); await expect(game).toHaveAttribute('data-tag-status', 'playing');
  await game.focus(); await page.keyboard.down('KeyW'); await page.keyboard.down('Space');
  await page.waitForTimeout(900); await page.keyboard.up('KeyW'); await page.keyboard.up('Space');
  await expect.poll(async () => Number(await game.getAttribute('data-tag-distance'))).toBeGreaterThan(1);
  await expect.poll(async () => Number(await game.getAttribute('data-tag-shots'))).toBeGreaterThan(1);
  await page.locator('.star-tag__toolbar button').filter({ hasText: es ? 'Pantalla grande' : 'Big screen' }).click();
  await screenshot(page, info, 'star-tag-live-arena'); await noOverflow(page);
  await page.locator('.star-tag__toolbar button').filter({ hasText: es ? 'Pausa' : 'Pause' }).click();
  await expect(game).toHaveAttribute('data-tag-status', 'paused');
  const distance = await game.getAttribute('data-tag-distance'), shots = await game.getAttribute('data-tag-shots');
  await page.waitForTimeout(450); expect(await game.getAttribute('data-tag-distance')).toBe(distance); expect(await game.getAttribute('data-tag-shots')).toBe(shots);
  await page.getByTestId('tag-start').click();
  const pad = page.getByTestId('tag-move'); const box = await pad.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 12); await page.mouse.down(); await page.waitForTimeout(450); await page.mouse.up();
  await expect.poll(async () => Number(await game.getAttribute('data-tag-distance'))).toBeGreaterThan(Number(distance));
  await game.focus(); await page.keyboard.press('Escape'); await expect(game).toHaveAttribute('data-tag-status', 'paused');
  await page.getByRole('button', { name: es ? 'Nueva aventura' : 'New adventure', exact: true }).click();
  await expect(game).toHaveAttribute('data-tag-shots', '0'); await expect(game).toHaveAttribute('data-tag-shield', '100');
  await page.locator('.star-tag__toolbar button').first().click(); await expect(page.getByTestId('open-star-tag')).toBeVisible();
  expect(errors).toEqual([]);
});

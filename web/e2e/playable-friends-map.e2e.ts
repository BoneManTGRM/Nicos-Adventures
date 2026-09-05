import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { cameraFor, STOPS, TOKENS } from '../src/game/friendsMap/simulation';
async function open(page: Page, info: TestInfo) {
  await page.goto('/'); await page.locator('.fw-brand').click();
  const es = info.project.metadata.language === 'es-MX';
  if (es) await page.getByRole('button', { name: 'Cambiar a español de México' }).click();
  await page.locator('.fw-destination-grid > .fw-destination').filter({ has: page.getByText(es ? 'Sala de juegos' : 'Game Arcade', { exact: true }) }).click();
  await page.getByTestId('open-friends-map').click();
  await expect(page.getByTestId('map-start')).toBeEnabled({ timeout: 25000 });
  await page.getByTestId('map-start').click();
  await expect(page.locator('.friends-map')).toHaveAttribute('data-map-status', 'playing');
  return es;
}
async function photo(page: Page, info: TestInfo, label: string) {
  await info.attach(label, { body: await page.screenshot(), contentType: 'image/png' });
}
async function visit(page: Page, point: { id: string; x: number; y: number }, stars = false) {
  await page.locator('.friends-map__status button').click();
  await page.locator(stars ? '[data-map-mode-choice="stars"]' : '[data-map-mode-choice="explore"]').click();
  await page.locator(`[data-map-destination="${point.id}"]`).click();
  await expect.poll(() => page.getByTestId('friends-map-canvas').evaluate((node: HTMLCanvasElement, goal) => Math.hypot(Number(node.dataset.x) - goal.x, Number(node.dataset.y) - goal.y), point), { timeout: 25000 }).toBeLessThan(12);
  await expect(page.getByTestId('friends-map-canvas')).toHaveAttribute('data-path', '0');
}
test('the new map replaces quiz cards in the main arcade and needs no WebGL', async ({ page }, info) => {
  await page.addInitScript(() => {
    const old = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(window, 'mapWebGLRequests', { value: 0, writable: true });
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, ...args: unknown[]) {
      if (String(args[0]).includes('webgl')) (window as unknown as { mapWebGLRequests: number }).mapWebGLRequests++;
      return Reflect.apply(old, this, args);
    } as typeof old;
  });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, info);
  await expect(page.getByTestId('friends-map-canvas')).toHaveAttribute('data-renderer', 'canvas2d');
  expect(await page.evaluate(() => (window as unknown as { mapWebGLRequests: number }).mapWebGLRequests)).toBe(0);
  await photo(page, info, 'friends-map-desktop-or-phone');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await page.locator('.friends-map__top button').first().click();
  await expect(page.locator('.arcade-legacy')).not.toHaveAttribute('open', '');
  await expect(page.locator('.fw-game-card').first()).not.toBeVisible();
  await expect(page.getByTestId('open-star-tag')).toBeVisible();
  expect(errors).toEqual([]);
});
test('walking is capped, becomes idle, pauses and releases cancelled touch input', async ({ page }, info) => {
  await open(page, info); const canvas = page.getByTestId('friends-map-canvas');
  await page.waitForTimeout(300); const idleFrames = Number(await canvas.getAttribute('data-frames'));
  await page.waitForTimeout(700); expect(Number(await canvas.getAttribute('data-frames'))).toBe(idleFrames);
  const up = page.locator('[data-map-direction="up"]'), box = (await up.boundingBox())!;
  const before = Number(await canvas.getAttribute('data-frames')), now = Date.now();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.waitForTimeout(1000); await page.mouse.up();
  const elapsed = (Date.now() - now) / 1000, rendered = Number(await canvas.getAttribute('data-frames')) - before;
  expect(rendered / elapsed).toBeLessThanOrEqual(32); expect(rendered).toBeGreaterThan(3);
  expect(Number(await canvas.getAttribute('data-traveled'))).toBeGreaterThan(5);
  // Cancellation must release a still-held pointer, not an already released one.
  await up.evaluate(node => node.addEventListener('pointerdown', event => node.setAttribute('data-last-pointer', String((event as PointerEvent).pointerId)), { once: true }));
  await page.mouse.down(); await page.waitForTimeout(100);
  const heldId = Number(await up.getAttribute('data-last-pointer'));
  await up.dispatchEvent('pointercancel', { pointerId: heldId });
  await page.mouse.up();
  await page.waitForTimeout(150); const stopped = await canvas.getAttribute('data-frames');
  await page.waitForTimeout(450); expect(await canvas.getAttribute('data-frames')).toBe(stopped);
  await canvas.focus(); await page.keyboard.down('KeyD'); await page.waitForTimeout(150); await page.getByTestId('map-pause').click(); await page.keyboard.up('KeyD');
  const paused = await canvas.getAttribute('data-frames'); await page.waitForTimeout(450);
  expect(await canvas.getAttribute('data-frames')).toBe(paused);
  await page.getByTestId('map-start').click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.friends-map')).toHaveAttribute('data-map-status', 'paused');
  const metrics = await canvas.evaluate((node: HTMLCanvasElement) => ({ ...node.dataset, width: node.width, height: node.height }));
  expect(metrics.width).toBeLessThanOrEqual(1024); expect(metrics.height).toBeLessThanOrEqual(640);
  await info.attach('map-low-power-measurements', { body: Buffer.from(JSON.stringify({ ...metrics, rendered, elapsed, observedFramesPerSecond: rendered / elapsed, idleRedraws: 0 }, null, 2)), contentType: 'application/json' });
});
test('all five friends explore, finish activities and stars, and retain nonduplicated progress', async ({ page, context }, info) => {
  test.setTimeout(180000); await open(page, info);
  for (const [i, point] of STOPS.entries()) {
    await page.locator(`[data-map-friend="${['nico','becca','lua','boltbot','sparky'][i]}"]`).click();
    await visit(page, point);
    await expect(page.getByTestId('map-action')).toBeEnabled(); await page.getByTestId('map-action').click();
    await expect(page.locator('.friends-map')).toHaveAttribute('data-map-completed', new RegExp(point.id));
    await expect(page.getByTestId('map-action')).toBeEnabled();
    if (i === 1) await photo(page, info, 'friends-helping-at-workshop');
  }
  for (const token of TOKENS) await visit(page, token, true);
  await expect(page.locator('.friends-map')).toHaveAttribute('data-map-progress', '8');
  await photo(page, info, 'eight-stars-completed');
  const oldStars = await page.locator('.fw-profile-pill').nth(1).textContent();
  await visit(page, STOPS[0]); await page.getByTestId('map-action').click();
  await expect(page.getByTestId('map-action')).toBeDisabled(); await expect(page.getByTestId('map-action')).toBeEnabled(); expect(await page.locator('.fw-profile-pill').nth(1).textContent()).toBe(oldStars);
  // Already-loaded local gameplay is independent of a server or another player.
  await context.setOffline(true); await page.getByTestId('friends-map-canvas').focus();
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight');
  await context.setOffline(false); await page.reload();
  await page.getByTestId('open-friends-map').click(); await expect(page.getByTestId('map-start')).toBeEnabled();
  await expect(page.locator('.friends-map')).toHaveAttribute('data-map-progress', '5');
  expect(await page.locator('.fw-profile-pill').nth(1).textContent()).toBe(oldStars);
  await page.getByTestId('map-start').click(); await page.locator('.friends-map__status button').click();
  await page.locator('[data-map-mode-choice="parade"]').click(); await expect(page.locator('.friends-map')).toHaveAttribute('data-map-progress', '5');
});
test('a missing character asset can be retried without trapping the player', async ({ page }, info) => {
  await page.route('**/becca-premium-v2-*.webp', route => route.fulfill({ status: 503, body: '' }));
  await page.goto('/'); await page.locator('.fw-brand').click();
  await page.locator('.fw-destination-grid > .fw-destination').filter({ has: page.getByText('Game Arcade', { exact: true }) }).click();
  await page.getByTestId('open-friends-map').click();
  await expect(page.locator('.friends-map__overlay')).toContainText('The map could not load');
  await page.unroute('**/becca-premium-v2-*.webp'); await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByTestId('map-start')).toBeEnabled({ timeout: 25000 });
  await photo(page, info, 'map-asset-recovery');
});
test('tap-to-walk uses the illustrated map and switches the camera without scrolling', async ({ page, isMobile }, info) => {
  await open(page, info);
  const canvas = page.getByTestId('friends-map-canvas');
  const beforeOverview = Number(await canvas.getAttribute('data-frames'));
  await page.locator('.friends-map__overview').click();
  await expect(page.locator('.friends-map__overview')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => Number(await canvas.getAttribute('data-frames'))).toBeGreaterThan(beforeOverview);
  const current = await canvas.evaluate((node: HTMLCanvasElement) => ({ x: Number(node.dataset.x), y: Number(node.dataset.y), width: node.width, height: node.height }));
  const camera = cameraFor(current, current.width, current.height, true);
  const target = STOPS[1], rect = (await canvas.boundingBox())!;
  const x = rect.x + (target.x - camera.x) * camera.scale / current.width * rect.width;
  const y = rect.y + (target.y - camera.y) * camera.scale / current.height * rect.height;
  if (isMobile) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
  await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement, point) => Math.hypot(Number(node.dataset.x) - point.x, Number(node.dataset.y) - point.y), target), { timeout: 20000 }).toBeLessThan(12);
  await expect(canvas).toHaveAttribute('data-path', '0');
  await expect(page.getByTestId('map-action')).toBeEnabled();
  await photo(page, info, 'tap-to-walk-whole-island');
  await page.locator('.friends-map__overview').click();
  await expect(page.locator('.friends-map__overview')).toHaveAttribute('aria-pressed', 'false');
  await photo(page, info, 'tap-to-walk-follow-camera');
  await page.locator('.friends-map__status button').click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.friends-map')).toHaveAttribute('data-map-status', 'paused');
});

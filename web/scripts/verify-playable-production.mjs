import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = 'https://nicos-world.com';
const expected = process.env.EXPECTED_SHA;
if (!/^[a-f0-9]{40}$/i.test(expected ?? '')) throw new Error('EXPECTED_SHA must be an exact commit SHA.');
await mkdir('production-proof', { recursive: true });
const evidence = { origin, expectedCommit: expected, startedAt: new Date().toISOString(), checks: [], release: null };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
try {
  // Cloudflare builds independently from this workflow. Wait for its exact
  // release, never approve whichever older version happens to be online.
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${origin}/release.json?verification=${expected}`, {
        cache: 'no-store', signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        const release = await response.json();
        if (release.commitSha === expected) { evidence.release = release; break; }
      }
    } catch (error) { console.log(`Release not ready: ${error.message}`); }
    await wait(5000);
  }
  if (!evidence.release) throw new Error('The expected commit did not reach nicos-world.com within the deployment window.');
  evidence.checks.push('exact-production-commit');
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const tv = page.locator('.nico-video-card');
  await expect(tv).toBeVisible({ timeout: 30000 });
  await tv.scrollIntoViewIfNeeded();
  const separate = await tv.evaluate(card => {
    const a = card.querySelector('.nico-video-card__copy').getBoundingClientRect();
    const b = card.querySelector('.nico-video-card__frame').getBoundingClientRect();
    return a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1;
  });
  expect(separate).toBe(true);
  await expect(page.locator('.nico-video-card__play')).toBeEnabled({ timeout: 30000 });
  await page.locator('.nico-video-card__play').click();
  await expect.poll(() => page.locator('.nico-video-card video').evaluate(video => video.currentTime), { timeout: 20000 }).toBeGreaterThan(0);
  await page.screenshot({ path: 'production-proof/nico-tv-desktop.png' });
  evidence.checks.push('desktop-tv-layout-and-playback');
  const destination = title => page.locator('.fw-destination-grid > .fw-destination').filter({ has: page.getByText(title, { exact: true }) });
  await destination('Robot Home').click();
  const room = page.locator('.living-home__room');
  await expect(room).toBeVisible();
  await page.locator('[data-home-select="nico"]').click();
  const x = Number(await room.getAttribute('data-home-x'));
  await room.focus(); await page.keyboard.down('ArrowRight');
  try { await expect.poll(async () => Number(await room.getAttribute('data-home-x'))).toBeGreaterThan(x + 3); }
  finally { await page.keyboard.up('ArrowRight'); }
  await page.locator('[data-home-activity="dance"]').click();
  await expect(room).toHaveAttribute('data-home-action', 'dance', { timeout: 15000 });
  await expect(page.locator('[data-home-activity="dance"] small')).toHaveText('✓');
  await room.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'production-proof/living-home.png' });
  evidence.checks.push('home-movement-and-activity');
  await page.locator('.fw-brand').click();
  await destination('Game Arcade').click();
  await page.getByTestId('open-star-tag').click();
  await expect(page.getByTestId('tag-start')).toBeEnabled({ timeout: 30000 });
  await page.getByRole('button', { name: 'Big screen', exact: true }).click();
  await page.getByTestId('tag-start').click();
  const arena = page.locator('.star-tag');
  await expect(arena).toHaveAttribute('data-tag-status', 'playing');
  await arena.focus(); await page.keyboard.down('KeyW'); await page.keyboard.down('Space');
  try {
    await expect.poll(async () => Number(await arena.getAttribute('data-tag-distance'))).toBeGreaterThan(1);
    await expect.poll(async () => Number(await arena.getAttribute('data-tag-shots'))).toBeGreaterThan(1);
  } finally { await page.keyboard.up('KeyW'); await page.keyboard.up('Space'); }
  await page.screenshot({ path: 'production-proof/star-tag-arena.png' });
  await arena.focus(); await page.keyboard.press('Escape');
  await expect(arena).toHaveAttribute('data-tag-status', 'paused');
  evidence.checks.push('3d-arena-start-movement-fire-and-pause');
  expect(errors).toEqual([]);
  evidence.checks.push('no-uncaught-browser-errors');
  evidence.status = 'passed';
} catch (error) {
  evidence.status = 'failed'; evidence.error = error.stack ?? error.message;
  throw error;
} finally {
  evidence.finishedAt = new Date().toISOString();
  await writeFile('production-proof/verification.json', `${JSON.stringify(evidence, null, 2)}\n`);
  await browser?.close();
  console.log(JSON.stringify(evidence, null, 2));
}

import { expect, test, type Page } from '@playwright/test';
import { expectImageReady } from './imageReadiness';

// All requests are fulfilled in this browser context; no external server is contacted.
const imageUrl = 'https://image-readiness.invalid/illustration.png';
const validPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==',
  'base64',
);
const failureMessage = 'Image must finish loading with positive intrinsic width';

async function showImage(page: Page) {
  await page.setContent(`<img src="${imageUrl}" alt="Test illustration" width="40" height="24">`, {
    waitUntil: 'domcontentloaded',
  });
  const image = page.getByRole('img', { name: 'Test illustration' });
  await expect(image).toBeVisible();
  return image;
}

test('image readiness waits for a delayed response instead of treating visibility as loading', async ({ page }) => {
  let release!: () => void;
  let requested!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const requestStarted = new Promise<void>(resolve => { requested = resolve; });
  await page.route(imageUrl, async route => {
    requested();
    await gate;
    await route.fulfill({ status: 200, contentType: 'image/png', body: validPng });
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const image = await showImage(page);
    await requestStarted;
    expect(await image.evaluate((img: HTMLImageElement) => img.complete)).toBe(false);
    // Inject a delayed response, not a sleep before the assertion. The check starts while pending.
    const readiness = expectImageReady(image);
    timer = setTimeout(release, 350);
    await readiness;
    expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
  } finally {
    if (timer) clearTimeout(timer);
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
});

for (const broken of [
  { name: 'missing', status: 404, contentType: 'text/plain', body: 'Not found' },
  { name: 'corrupt', status: 200, contentType: 'image/png', body: 'Not a valid image' },
]) {
  test(`image readiness rejects a ${broken.name} image even when complete is true`, async ({ page }) => {
    await page.route(imageUrl, route => route.fulfill(broken));
    const image = await showImage(page);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete)).toBe(true);
    expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(0);
    await expect(expectImageReady(image, { timeout: 300 })).rejects.toThrow(failureMessage);
  });
}

test('image readiness rejects a stalled response within its bounded timeout', async ({ page }) => {
  let release!: () => void;
  let requested!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const requestStarted = new Promise<void>(resolve => { requested = resolve; });
  await page.route(imageUrl, async route => {
    requested();
    await gate;
    await route.abort();
  });
  try {
    const image = await showImage(page);
    await requestStarted;
    const started = Date.now();
    await expect(expectImageReady(image, { timeout: 300 })).rejects.toThrow(failureMessage);
    // A broad upper bound detects ignored timeouts without making this a timing benchmark.
    expect(Date.now() - started).toBeLessThan(2500);
    expect(await image.evaluate((img: HTMLImageElement) => img.complete)).toBe(false);
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
});

import { expect, test } from '@playwright/test';
import { TRICKS } from '../src/world/petPlay';

test.use({ serviceWorkers: 'allow' });

test('pet playground and every Sparky pose remain available after going offline', async ({ page, context }, info) => {
  test.setTimeout(120_000);
  const es = info.project.metadata.language === 'es-MX';
  await page.goto('/');
  await expect(page.getByTestId('continue-world')).toBeVisible();
  await page.evaluate(({ es, tricks }) => {
    const key = 'nicos-world-local-save-v4';
    const store = JSON.parse(localStorage.getItem(key)!);
    const profile = store.profiles.find((item: { id: string }) => item.id === store.activeProfileId);
    Object.assign(profile, {
      selectedSection: 'pet-workshop', language: es ? 'es-MX' : 'en', activePetId: 'offline-sparky',
      pets: [{ id: 'offline-sparky', name: 'Sparky', species: 'Robot Dog', color: 'Blue', accessory: 'Explorer Scarf', personality: 'Playful', bond: 73, tricks }],
    });
    localStorage.setItem(key, JSON.stringify(store));
  }, { es, tricks: TRICKS.map(trick => trick.id) });
  await page.reload();
  await expect(page.locator('.pet-haven')).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, { timeout: 60_000 });
  const cached = await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(names.find(name => name === 'nicos-world-static-v27') ?? 'missing');
    return (await cache.keys()).map(request => new URL(request.url).pathname);
  });
  expect(cached.filter(path => /\/PetWorkshop-.*\.(?:js|css)$/.test(path))).toHaveLength(2);
  expect(cached.filter(path => /\/sparky-(?:idle|sit|high-five|fetch-tool)-v2-.*\.webp$/.test(path))).toHaveLength(4);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.pet-haven__bond')).toContainText('73/100');
  await expect.poll(() => page.locator('.pet-haven__actor img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.locator('.pet-haven__nav').getByRole('button', { name: es ? 'Trucos' : 'Train', exact: true }).click();
  for (const [index, pose] of [[0, 'sit'], [3, 'high-five'], [2, 'fetch-tool']] as const) {
    await page.locator('.pet-haven__tricks article').nth(index).getByRole('button', { name: es ? 'Ver truco' : 'Perform', exact: true }).click();
    await expect(page.locator('.pet-haven__actor img')).toHaveAttribute('src', new RegExp(`sparky-${pose}-v2-`));
    await expect.poll(() => page.locator('.pet-haven__actor img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await info.attach('offline-sparky-performance', { body: await page.screenshot(), contentType: 'image/png' });
});

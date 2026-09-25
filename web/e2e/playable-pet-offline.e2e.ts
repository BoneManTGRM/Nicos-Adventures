import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { expect, test } from '@playwright/test';
import { TRICKS } from '../src/world/petPlay';

test.use({ serviceWorkers: 'allow' });

/** Read-only, loopback-only mirror. Stopping this server never stops the real site. */
async function ownedOrigin(upstream: string) {
  const base = new URL(upstream);
  let requests = 0;
  const server = createServer(async (request, response) => {
    requests++;
    try {
      const target = new URL(request.url ?? '/', base);
      if (target.origin !== base.origin || !['GET', 'HEAD'].includes(request.method ?? '')) {
        response.writeHead(405); response.end(); return;
      }
      const source = await fetch(target, { method: request.method, redirect: 'error', signal: AbortSignal.timeout(15_000) });
      const bytes = Buffer.from(await source.arrayBuffer());
      if (response.destroyed) return;
      response.statusCode = source.status;
      for (const header of ['content-type', 'cache-control', 'content-security-policy', 'service-worker-allowed']) {
        const value = source.headers.get(header); if (value) response.setHeader(header, value);
      }
      // fetch has decoded the body; do not forward compressed content-length/encoding.
      response.end(bytes);
    } catch {
      if (!response.destroyed) { response.writeHead(502); response.end('Test origin unavailable'); }
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject); server.listen(0, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    count: () => requests,
    listening: () => server.listening,
    stop: () => new Promise<void>((resolve, reject) => {
      if (!server.listening) { resolve(); return; }
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}

test('cached pet play survives Chromium offline or a WebKit origin outage', async ({ page, context, browser, browserName }, info) => {
  test.setTimeout(120_000);
  const es = info.project.metadata.language === 'es-MX';
  const upstream = info.project.use.baseURL;
  if (!upstream) throw new Error('The exact preview or production origin is required');
  // Pinned WebKit rejects SW responses under setOffline, including literal HTML.
  // https://github.com/microsoft/playwright/issues/42775
  // Use a real stopped origin, with a no-worker negative control, not a skip or a fake offline flag.
  const mirror = browserName === 'webkit' ? await ownedOrigin(upstream) : null;
  const origin = mirror?.url ?? upstream;
  const evidence: Record<string, unknown> = {
    upstream, origin, browserName,
    mode: mirror ? 'origin-unavailable-control' : 'browser-offline-emulation',
    limitation: mirror ? 'Origin outage is not OS-level or physical-iPhone offline certification; Playwright issue 42775.' : null,
  };
  if (mirror) info.annotations.push({ type: 'qualification-scope', description: 'WebKit: real origin outage, not setOffline emulation (Playwright #42775).' });
  try {
    await page.goto(origin);
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
    evidence.cachedAssets = cached;
    if (mirror) {
      await mirror.stop(); expect(mirror.listening()).toBe(false);
      evidence.originListening = mirror.listening();
      const negative = await browser.newContext({ serviceWorkers: 'block' });
      try {
        const controlPage = await negative.newPage();
        const failsWithoutWorker = await controlPage.goto(origin, { timeout: 10_000 }).then(() => false, () => true);
        expect(failsWithoutWorker).toBe(true); evidence.negativeControlFailedNavigation = failsWithoutWorker;
      } finally { await negative.close(); }
    } else {
      await context.setOffline(true);
    }
    const requestsBefore = mirror?.count();
    const restored = await page.reload({ waitUntil: 'domcontentloaded' });
    expect(restored?.status()).toBe(200);
    expect(restored?.fromServiceWorker()).toBe(true);
    evidence.navigation = { status: restored?.status(), fromServiceWorker: restored?.fromServiceWorker() };
    await expect(page.locator('.pet-haven__bond')).toContainText('73/100');
    await expect.poll(() => page.locator('.pet-haven__actor img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.locator('.pet-haven__nav').getByRole('button', { name: es ? 'Trucos' : 'Train', exact: true }).click();
    for (const [index, pose] of [[0, 'sit'], [3, 'high-five'], [2, 'fetch-tool']] as const) {
      await page.locator('.pet-haven__tricks article').nth(index).getByRole('button', { name: es ? 'Ver truco' : 'Perform', exact: true }).click();
      await expect(page.locator('.pet-haven__actor img')).toHaveAttribute('src', new RegExp(`sparky-${pose}-v2-`));
      await expect.poll(() => page.locator('.pet-haven__actor img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    if (mirror) {
      evidence.originRequestsDuringOutage = mirror.count() - requestsBefore!;
      expect(evidence.originRequestsDuringOutage).toBe(0);
    }
    await info.attach('cached-sparky-performance', { body: await page.screenshot(), contentType: 'image/png' });
  } finally {
    await info.attach('network-disruption-evidence', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
    await mirror?.stop();
  }
});

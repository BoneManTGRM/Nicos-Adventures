import { expect, test, type Page, type TestInfo } from '@playwright/test';
import type { LocalProfile, PetRecord } from '../src/types';
import { TRICKS } from '../src/world/petPlay';
const key = 'nicos-world-local-save-v4';
const es = (info: TestInfo) => info.project.metadata.language === 'es-MX';
const pet = (overrides: Partial<PetRecord> = {}): PetRecord => ({ id: 'pet-test-sparky', name: 'Sparky', species: 'Robot Dog', color: 'Blue', accessory: 'Explorer Scarf', personality: 'Playful', bond: 73, tricks: TRICKS.map(t => t.id), ...overrides });
const profile = (page: Page): Promise<LocalProfile> => page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)!); return s.profiles.find((p: { id: string }) => p.id === s.activeProfileId); }, key);
async function boot(page: Page, info: TestInfo, pets: PetRecord[] = [pet()]) {
  await page.goto('/'); await expect(page.getByTestId('continue-world')).toBeVisible();
  await page.evaluate(({ key, pets, language }) => {
    const store = JSON.parse(localStorage.getItem(key)!);
    const active = store.profiles.find((p: { id: string }) => p.id === store.activeProfileId);
    Object.assign(active, { pets, activePetId: pets[0]?.id ?? null, selectedSection: 'pet-workshop', language, stars: 20 });
    localStorage.setItem(key, JSON.stringify(store));
  }, { key, pets, language: es(info) ? 'es-MX' : 'en' });
  await page.reload(); await expect(page.locator('.pet-haven')).toBeVisible();
}
async function tab(page: Page, name: string) { await page.locator('.pet-haven__nav').getByRole('button', { name, exact: true }).click(); }
async function cues(page: Page) {
  for (let index = 0; index < 3; index++) {
    const text = (await page.locator('.pet-haven__sequence [aria-current="step"] small').textContent()) ?? '';
    expect(text).toMatch(/^\d+\.\s*\S/);
    await page.locator('.pet-haven__cue-buttons').getByRole('button', { name: text.replace(/^\d+\.\s*/, ''), exact: true }).click();
  }
  await expect(page.locator('.pet-haven__challenge')).toContainText(/Great teamwork|Gran trabajo/);
}

test('retains an existing mastered pet, completes fetch, and saves style without losing progress', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await boot(page, info);
  await expect(page.locator('.pet-haven__bond')).toContainText('73/100');
  await expect(page.locator('.pet-haven__stage')).toContainText('6/6');
  await page.getByRole('button', { name: /Tool treasure hunt|Búsqueda de herramientas/ }).click();
  for (let count = 0; count < 5; count++) await page.getByRole('button', { name: /Collect tool|Recoger herramienta/ }).click();
  expect((await profile(page)).pets[0].bond).toBe(77);
  expect((await profile(page)).stars).toBe(20);
  await expect(page.getByRole('button', { name: es(info) ? 'Otra vez' : 'Play again', exact: true })).toBeVisible();
  await tab(page, es(info) ? 'Diseño' : 'Style');
  await page.locator('.pet-haven__editor input').fill('Luna');
  await page.locator('.pet-haven__editor select').nth(0).selectOption('Purple');
  await page.getByRole('button', { name: /Save pet$|Guardar mascota$/ }).click();
  await page.reload();
  await expect(page.locator('.pet-haven__stage h2')).toHaveText('Luna');
  const result = await profile(page);
  expect(result.pets[0]).toMatchObject({ name: 'Luna', color: 'Purple', bond: 77, tricks: TRICKS.map(t => t.id) });
  expect(result.stars).toBe(20);
  await info.attach('pet-play-mobile-and-desktop', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  expect(errors).toEqual([]);
});

test('guided training requires three cues; mistakes and replays never duplicate stars', async ({ page }, info) => {
  await boot(page, info, [pet({ bond: 1, tricks: [] })]);
  await tab(page, es(info) ? 'Trucos' : 'Train');
  await page.locator('.pet-haven__tricks article').first().getByRole('button', { name: es(info) ? 'Aprender' : 'Learn', exact: true }).click();
  await page.locator('.pet-haven__cue-buttons button').nth(2).click();
  expect((await profile(page)).pets[0].tricks).toEqual([]);
  await cues(page);
  let saved = await profile(page);
  expect(saved.pets[0]).toMatchObject({ bond: 13, tricks: ['Sit'] }); expect(saved.stars).toBe(21);
  await page.getByRole('button', { name: es(info) ? 'Otra vez' : 'Play again', exact: true }).click();
  await cues(page); saved = await profile(page);
  expect(saved.pets[0].bond).toBe(15); expect(saved.stars).toBe(21);
  await info.attach('guided-trick-complete', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await page.reload(); expect((await profile(page)).pets[0].tricks).toEqual(['Sit']);
});

test('protects unsaved designs, keeps each pet separate, and preserves progress through a stale draft', async ({ page }, info) => {
  await boot(page, info, [pet(), pet({ id: 'owl-test', name: 'Ollie', species: 'Owl Scout', color: 'Green', accessory: 'Star Collar', bond: 25, tricks: [] })]);
  await tab(page, es(info) ? 'Diseño' : 'Style'); await page.locator('.pet-haven__editor input').fill('My unsaved friend');
  await tab(page, es(info) ? 'Trucos' : 'Train');
  await page.locator('.pet-haven__tricks article').first().getByRole('button', { name: /Practice|Practicar/ }).click(); await cues(page);
  await tab(page, es(info) ? 'Diseño' : 'Style'); await page.getByRole('button', { name: /Save pet$|Guardar mascota$/ }).click();
  expect((await profile(page)).pets[0]).toMatchObject({ name: 'My unsaved friend', bond: 75 });
  await tab(page, es(info) ? 'Diseño' : 'Style'); await page.locator('.pet-haven__editor input').fill('Do not save this');
  await tab(page, es(info) ? 'Mascotas' : 'My pets'); await page.locator('.pet-haven__roster').getByRole('button', { name: /Ollie/ }).click();
  await expect(page.locator('.pet-haven__save-guard')).toBeVisible();
  await page.getByRole('button', { name: es(info) ? 'Seguir editando' : 'Keep editing', exact: true }).click();
  await expect(page.locator('.pet-haven__roster').getByRole('button', { name: /Ollie/ })).toBeFocused();
  expect((await profile(page)).activePetId).toBe('pet-test-sparky');
  await page.locator('.pet-haven__roster').getByRole('button', { name: /Ollie/ }).click();
  await page.getByRole('button', { name: es(info) ? 'Descartar cambios' : 'Discard changes', exact: true }).click();
  await expect(page.locator('.pet-haven__stage h2')).toHaveText('Ollie');
  const result = await profile(page); expect(result.pets[0].name).toBe('My unsaved friend'); expect(result.pets[1].bond).toBe(25);
});

test('phone layout, backdrops, touch targets and reduced motion remain usable', async ({ page }, info) => {
  await boot(page, info, [pet({ species: 'Owl Scout', color: 'Green', accessory: 'Star Collar' })]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBe(true);
  for (const scene of ['space', 'sunset', 'garden']) {
    const names = { space: es(info) ? 'Espacio' : 'Space', sunset: es(info) ? 'Atardecer' : 'Sunset', garden: es(info) ? 'Jardín' : 'Garden' };
    await page.locator('.pet-haven__scenes').getByRole('button', { name: new RegExp(names[scene as keyof typeof names]) }).click();
    await expect(page.locator('.pet-haven__stage')).toHaveClass(new RegExp(`pet-haven__stage--${scene}`));
  }
  const targets = await page.locator('.pet-haven button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect()).filter(rect => rect.width && rect.height).map(rect => ({ width: rect.width, height: rect.height })));
  for (const target of targets) { expect(target.width).toBeGreaterThanOrEqual(44); expect(target.height).toBeGreaterThanOrEqual(44); }
  await tab(page, es(info) ? 'Trucos' : 'Train');
  await page.locator('.pet-haven__tricks article').first().getByRole('button', { name: es(info) ? 'Ver truco' : 'Perform', exact: true }).click();
  await expect(page.locator('.pet-haven__actor')).toHaveAttribute('data-action', 'Sit');
  await expect(page.locator('.pet-haven__speech')).toContainText(es(info) ? 'Sentarse' : 'Sit');
  expect((await profile(page)).pets[0].bond).toBe(73);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.pet-haven__actor').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await page.locator('.pet-haven__stage').scrollIntoViewIfNeeded();
  await info.attach('owl-play-scene', { body: await page.screenshot(), contentType: 'image/png' });
});

test('every species keeps illustrated art through customization and saving', async ({ page }, info) => {
  await boot(page, info);
  await tab(page, es(info) ? 'Diseño' : 'Style');
  const cards = page.locator('.pet-haven__species-grid button');
  await expect(cards).toHaveCount(8);
  for (let index = 0; index < 8; index++) {
    await cards.nth(index).click();
    await expect(cards.nth(index)).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.locator('.pet-haven__actor img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect((await profile(page)).pets[0].species).toBe('Robot Dog');
  }
  // Reproduce the reported owl/color/accessory combination through the visual picker.
  await cards.nth(6).click();
  await page.locator('.pet-haven__editor select').nth(0).selectOption('Green');
  await page.locator('.pet-haven__editor select').nth(1).selectOption('Star Collar');
  await expect(page.locator('.pet-haven__actor [data-pet-renderer]')).toHaveAttribute('data-pet-renderer', 'premium-collection');
  await expect(page.locator('.pet-haven__actor img')).toHaveAttribute('src', /crew-owl-scout-v3/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBe(true);
  const figure = await page.locator('.pet-haven__actor img').boundingBox();
  const speech = await page.locator('.pet-haven__speech').boundingBox();
  expect(figure && speech && figure.y + figure.height <= speech.y + 2, JSON.stringify({ figure, speech })).toBe(true);
  await info.attach('matching-pet-collection', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await page.getByRole('button', { name: /Save pet$|Guardar mascota$/ }).click();
  await page.reload();
  expect((await profile(page)).pets[0]).toMatchObject({ species: 'Owl Scout', color: 'Green', accessory: 'Star Collar', bond: 73, tricks: TRICKS.map(t => t.id) });
  await expect.poll(() => page.locator('.pet-haven__actor img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

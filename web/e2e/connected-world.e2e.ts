import { expect, test } from '@playwright/test';
import type { LocalProfile } from '../src/types';
import { applyStarBridgeEvent, CONSTELLATION } from '../src/game/goldenAdventureProfile';
import type { StarBridgeEvent } from '../src/game/goldenAdventure';
const events: StarBridgeEvent['type'][] = ['REVEAL_BRIDGE','CONFIGURE_ROBOT','PASS_MOVEMENT_TEST','PASS_SCANNER_TEST','PASS_LOGIC_TEST','INSPECT_BRIDGE','INSTALL_STAR_CORE','COMPLETE_ADVENTURE'];

test('homecoming artwork, placement, mini game, language and reload', async ({ page }, info) => {
  // Fixture starts after the independently tested mission; this is homecoming UI proof.
  const es = info.project.metadata.language === 'es-MX';
  await page.goto('/');
  await expect(page.getByTestId('continue-world')).toBeVisible();
  let profile: LocalProfile = await page.evaluate(() => JSON.parse(localStorage.getItem('nicos-world-local-save-v4')!).profiles[0]);
  profile.language = es ? 'es-MX' : 'en';
  profile.robot.name = 'Azure';
  profile.robots = profile.robots.map(robot => robot.id === profile.robot.id ? profile.robot : robot);
  profile.artwork = [{ id: 'poster-one', title: 'Our sky', background: 'Starry Space', subject: 'Azure', frame: 'Neon Frame', caption: 'Together among the stars' }];
  profile.displayedArtworkId = 'poster-one';
  for (const type of events) profile = applyStarBridgeEvent(profile, { type });
  profile.selectedSection = 'robot-home';
  await page.evaluate(value => {
    localStorage.setItem('nicos-world-local-save-v4', JSON.stringify({ schemaVersion: 4, activeProfileId: value.id, profiles: [value] }));
  }, profile);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.locator('.living-home__art [data-artwork-id="poster-one"]')).toContainText('Together among the stars');
  await expect(page.locator('.home-journal')).toContainText(es ? 'El puente que volvimos' : 'The bridge we brought');
  const object = page.getByRole('button', { name: es ? 'Colocar Constelación del Puente Estelar' : `Place ${CONSTELLATION}`, exact: true });
  await object.click();
  await page.getByRole('button', { name: es ? 'Lugar 9' : 'Spot 9', exact: true }).click();
  await expect(object).toHaveAttribute('style', /left: 78%; top: 52%/);
  await page.getByRole('button', { name: es ? 'Deshacer colocación' : 'Undo placement' }).click();
  await expect(object).not.toHaveAttribute('style', /left: 78%; top: 52%/);
  await object.click(); await page.getByRole('button', { name: es ? 'Colocar aquí 9' : 'Place here 9', exact: true }).click();
  await page.getByRole('button', {name: es ? 'Bosque' : 'Forest', exact:true}).click();
  await page.reload(); await expect(object).toHaveAttribute('style', /left: 78%; top: 52%/);
  await expect(page.locator('.living-home__room')).toHaveAttribute('data-theme','forest');
  await page.locator('[data-home-activity="repair"]').click();
  const workshop = page.locator('.home-workshop');
  await expect(workshop).toBeVisible();
  await workshop.getByRole('button', { name: es ? 'Batería nueva' : 'Fresh battery' }).click();
  await workshop.getByRole('button', { name: '▲', exact: true }).click();
  await workshop.getByRole('button', { name: es ? 'Probar lámpara' : 'Test lamp' }).click();
  await expect(page.locator('.living-home__lamp')).toHaveClass(/is-repaired/);
  await page.getByRole('button', { name: es ? 'Switch to English' : 'Cambiar a español de México', exact: true }).click();
  await expect(workshop).toContainText(es ? 'We did it together' : 'Lo logramos juntos');
  await workshop.getByRole('button', { name: es ? 'Close ×' : 'Cerrar ×' }).click();
  await page.reload(); await expect(page.locator('.living-home__lamp')).toHaveClass(/is-repaired/);
  const geometry = await page.evaluate(() => {
    const room = document.querySelector('.living-home__room')!.getBoundingClientRect();
    const nav = document.querySelector('.fw-bottom-nav')!.getBoundingClientRect();
    return { roomTop: room.top, overlap: room.bottom > nav.top && room.top < nav.bottom, overflow: document.documentElement.scrollWidth > innerWidth + 2 };
  });
  expect(geometry.overlap).toBe(false); expect(geometry.overflow).toBe(false); expect(geometry.roomTop).toBeLessThan(330);
  await info.attach('connected-home', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  expect(errors).toEqual([]);
});

test('Nico TV defers video transfer until play', async ({ page }) => {
  const transfers: string[] = []; page.on('request', request => { if (/\.mp4|\.b64/.test(request.url()) && /basketball/.test(request.url())) transfers.push(request.url()); });
  await page.goto('/');
  await expect(page.getByTestId('continue-world')).toBeVisible();
  await expect(page.locator('.nico-video-card video')).toHaveAttribute('preload', 'none');
  expect(transfers).toEqual([]);
  await page.locator('.nico-video-card__play').click();
  await expect.poll(() => transfers.some(url => url.endsWith('.mp4'))).toBe(true);
  expect(transfers.some(url => url.includes('.b64'))).toBe(false);
});

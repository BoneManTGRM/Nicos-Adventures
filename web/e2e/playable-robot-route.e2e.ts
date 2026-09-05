import { expect, test, type Page, type TestInfo, type Locator } from '@playwright/test';

function copy(info: TestInfo) {
  const es = info.project.metadata.language === 'es-MX';
  return { es, begin: es ? 'Comenzar la aventura' : 'Begin the adventure', chamber: es ? 'Continuar a la cámara de pruebas' : 'Continue to the test chamber',
    pass: es ? 'Aprobar prueba de movimiento' : 'Pass movement test', scanner: es ? 'Prueba del escáner' : 'Scanner test',
    undo: es ? 'Deshacer último paso' : 'Undo last step', reset: es ? 'Empezar de nuevo' : 'Start over' };
}
async function press(locator: Locator, info: TestInfo) {
  if (info.project.use.hasTouch) await locator.tap(); else await locator.click();
}
async function boot(page: Page, info: TestInfo) {
  const t = copy(info);
  await page.goto('/');
  if (t.es) await page.getByRole('button', { name: 'Cambiar a español de México' }).click();
  await press(page.getByRole('button', { name: t.begin, exact: true }), info);
  await press(page.getByRole('button', { name: new RegExp(t.chamber) }), info);
  await expect(page.locator('[data-route-version="guided-v1"]')).toBeVisible();
  return t;
}
async function proof(page: Page, info: TestInfo, name: string) {
  await info.attach(name, { body: await page.screenshot(), contentType: 'image/png' });
}

test('the screenshot route recovers without erasing correct moves and advances through all robot tests', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const t = await boot(page, info), route = page.locator('.boltbot-guided-route');
  const command = (name: string) => page.locator(`[data-route-command="${name}"]`);
  await press(command('forward'), info); await press(command('left'), info); await press(command('forward'), info);
  await expect(route).toHaveAttribute('data-route-progress', '1');
  await expect(page.locator('#boltbot-route-hint')).toContainText(t.es ? 'Derecha' : 'Right');
  await expect(page.locator('#boltbot-route-hint')).toContainText(t.es ? 'se conservan' : 'are kept');
  await expect(page.getByRole('button', { name: t.pass, exact: true })).toHaveCount(0);
  await expect(command('right')).toHaveAttribute('data-next', 'true');
  await proof(page, info, 'wrong-turn-progress-kept');
  await press(command('right'), info); await press(command('forward'), info);
  await expect(route).toHaveAttribute('data-route-progress', '3');
  await proof(page, info, 'movement-complete');
  await press(page.getByRole('button', { name: t.pass, exact: true }), info);
  await expect(page.getByRole('heading', { name: t.scanner, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: t.scanner, exact: true })).toBeVisible();
  await press(page.getByRole('button', { name: t.es ? /Conector del Núcleo Estelar/ : /Star Core socket/ }), info);
  await press(page.getByRole('button', { name: t.es ? 'Aprobar prueba del escáner' : 'Pass scanner test', exact: true }), info);
  await press(page.getByRole('button', { name: t.es ? '★ Estrella' : '★ Star', exact: true }), info);
  await press(page.getByRole('button', { name: t.es ? 'Completar cámara de pruebas' : 'Complete test chamber', exact: true }), info);
  await expect(page.getByRole('heading', { name: t.es ? '¡BoltBot está listo para el puente!' : 'BoltBot is bridge-ready!', exact: true })).toBeVisible();
  await proof(page, info, 'robot-bridge-ready');
  expect(errors).toEqual([]);
});

test('undo, reset, touch and keyboard inputs cannot leave an impossible four-step route', async ({ page }, info) => {
  const t = await boot(page, info), route = page.locator('.boltbot-guided-route');
  const command = (name: string) => page.locator(`[data-route-command="${name}"]`);
  await press(command('forward'), info); await press(command('right'), info);
  await press(page.getByRole('button', { name: t.undo, exact: true }), info);
  await expect(route).toHaveAttribute('data-route-progress', '1');
  await expect(command('right')).toHaveAttribute('data-next', 'true');
  await press(page.getByRole('button', { name: t.reset, exact: true }), info);
  await expect(route).toHaveAttribute('data-route-progress', '0');
  for (let i = 0; i < 5; i++) await command('forward').press('Enter');
  await expect(route).toHaveAttribute('data-route-progress', '1');
  await command('right').press('Enter'); await command('forward').press('Enter');
  await expect(route).toHaveAttribute('data-route-progress', '3');
  await expect(command('forward')).toBeDisabled(); await expect(command('left')).toBeDisabled();
  await page.getByRole('button', { name: t.undo, exact: true }).press('Enter');
  await expect(route).toHaveAttribute('data-route-progress', '2');
  await expect(page.getByRole('button', { name: t.pass, exact: true })).toHaveCount(0);
  await command('forward').press('Enter');
  await expect(page.getByRole('button', { name: t.pass, exact: true })).toBeEnabled();
});

test('required directions stay beside the controls on phones, rotation and reduced motion', async ({ page }, info) => {
  const t = await boot(page, info), route = page.locator('.boltbot-guided-route');
  await route.scrollIntoViewIfNeeded();
  await expect(page.getByRole('list', { name: t.es ? 'Ruta requerida' : 'Required route' })).toBeVisible();
  await expect(route.locator('[data-route-step="2"]')).toContainText(t.es ? 'Derecha' : 'Right');
  const geometry = await route.evaluate(node => {
    const parts = ['.boltbot-command-route', '#boltbot-route-hint', '.boltbot-route-buttons'].map(selector => node.querySelector(selector)!.getBoundingClientRect());
    return { ordered: parts[0].bottom <= parts[1].top && parts[1].bottom <= parts[2].top,
      buttons: [...node.querySelectorAll('.boltbot-route-buttons button')].map(b => b.getBoundingClientRect().height), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  expect(geometry.ordered).toBe(true); expect(geometry.buttons.every(n => n >= 44)).toBe(true); expect(geometry.overflow).toBeLessThanOrEqual(2);
  await proof(page, info, 'route-instructions-with-buttons');
  await page.setViewportSize({ width: 844, height: 390 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-route-command="forward"]').click();
  await expect(page.locator('.boltbot-mission')).toHaveAttribute('data-route-motion', 'reduced');
  await page.locator('[data-route-command="right"]').click(); await page.locator('[data-route-command="forward"]').click();
  await expect(route).toHaveAttribute('data-route-progress', '3');
  await expect(page.locator('.boltbot-mission canvas')).toHaveCount(0);
  await proof(page, info, 'landscape-route-complete');
});

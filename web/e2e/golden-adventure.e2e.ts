import { execFileSync } from "node:child_process";
import { expect, test, type Locator, type Page } from "@playwright/test";

type Language = "en" | "es-MX";

const expectedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: process.cwd(),
  encoding: "utf8",
}).trim();

const copy = {
  en: {
    world: "World Map",
    roboLab: "Robo Lab",
    configure: "Build a bridge-ready BoltBot",
    begin: "Begin the adventure",
    arms: "Arms",
    useRobot: "Use this BoltBot",
    movement: "Movement test",
    forward: "Forward",
    right: "Right",
    passMovement: "Pass movement test",
    scanner: "Scanner test",
    socket: "Star Core socket",
    passScanner: "Pass scanner test",
    logic: "Logic test",
    star: "Star",
    completeChamber: "Complete test chamber",
    returnMap: "Return to World Map",
    bridgeReturn: "Back to World Map",
    travelBridge: "Travel to the Star Bridge",
    darkSocket: "Dark Star Core socket",
    confirmFault: "Confirm bridge fault",
    align: "Align",
    lock: "Lock",
    charge: "Charge",
    install: "Install Star Core",
    activate: "Activate the bridge",
    bridgeComplete: "The bridge is restored!",
    dinosaur: "Dinosaur Valley",
    museum: "Memory Museum",
    achievement: "Star Bridge Engineer",
    settings: "Parent & Settings",
    backup: "Download backup",
    restore: "Restore backup",
    restoreSuccess: "Profile restored successfully.",
    restoredStatus: "Bridge restored · Valley unlocked",
  },
  "es-MX": {
    world: "Mapa del mundo",
    roboLab: "Laboratorio robot",
    configure: "Construye un BoltBot listo para el puente",
    begin: "Comenzar la aventura",
    arms: "Brazos",
    useRobot: "Usar este BoltBot",
    movement: "Prueba de movimiento",
    forward: "Adelante",
    right: "Derecha",
    passMovement: "Aprobar prueba de movimiento",
    scanner: "Prueba del escáner",
    socket: "Conector del Núcleo Estelar",
    passScanner: "Aprobar prueba del escáner",
    logic: "Prueba de lógica",
    star: "Estrella",
    completeChamber: "Completar cámara de pruebas",
    returnMap: "Volver al Mapa Mundial",
    bridgeReturn: "Volver al Mapa Mundial",
    travelBridge: "Viajar al Puente Estelar",
    darkSocket: "Conector oscuro del Núcleo Estelar",
    confirmFault: "Confirmar falla del puente",
    align: "Alinear",
    lock: "Fijar",
    charge: "Cargar",
    install: "Instalar Núcleo Estelar",
    activate: "Activar el puente",
    bridgeComplete: "¡El puente está restaurado!",
    dinosaur: "Valle de dinosaurios",
    museum: "Museo de recuerdos",
    achievement: "Ingeniero del Puente Estelar",
    settings: "Adultos y ajustes",
    backup: "Descargar respaldo",
    restore: "Restaurar respaldo",
    restoreSuccess: "Perfil restaurado correctamente.",
    restoredStatus: "Puente restaurado · Valle desbloqueado",
  },
} as const;

async function activateWithKeyboard(page: Page, locator: Locator) {
  await page.evaluate(() => new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  }));
  await expect(locator).toBeVisible();
  await locator.press("Enter");
}

async function assertLayout(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.alt || image.currentSrc),
  }));
  expect(metrics.documentWidth, `${label}: document overflow`).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.bodyWidth, `${label}: body overflow`).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.brokenImages, `${label}: broken images`).toEqual([]);
}

async function openDestination(page: Page, name: string) {
  const destination = page.locator(".fw-destination").filter({ hasText: name });
  await expect(destination).toHaveCount(1);
  await activateWithKeyboard(page, destination);
}

async function assertRendererReady(page: Page, reducedMotion: boolean) {
  const canvas = page.locator(".game-canvas").first();
  await expect(canvas).toHaveAttribute("data-renderer-status", "ready", { timeout: 30_000 });
  await expect(canvas).toHaveAttribute("data-reduced-motion", String(reducedMotion));
  await expect(canvas.locator("canvas")).toHaveCount(1);
}

async function waitForServiceWorkerControl(page: Page) {
  await expect.poll(
    () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)).catch(() => false),
    { timeout: 20_000 },
  ).toBe(true);
  await page.waitForLoadState("networkidle");
}

test("Golden Adventure passes the production browser matrix", async ({ page, context }, testInfo) => {
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];
  const expectsReducedMotion = testInfo.project.name === "webkit-iphone-es";
  const runtimeErrors: string[] = [];
  const externalRequests: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("request", (request) => {
    const target = new URL(request.url());
    if (target.protocol.startsWith("http") && target.origin !== "http://127.0.0.1:4173") externalRequests.push(target.origin);
  });

  await page.emulateMedia({ reducedMotion: expectsReducedMotion ? "reduce" : "no-preference" });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches).catch(() => false))
    .toBe(expectsReducedMotion);
  await expect(page.getByRole("heading", { name: "World Map", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await waitForServiceWorkerControl(page);
  await expect(page.getByRole("heading", { name: "World Map", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const releaseResponse = await page.request.get("/release.json");
  expect(releaseResponse.ok()).toBe(true);
  const release = await releaseResponse.json();
  expect(release).toMatchObject({ appVersion: "3.2.0", profileSchema: 4, commitSha: expectedCommit });
  expect(release.buildTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  for (const key of ["assetManifestHash", "serviceWorkerHash", "buildHash"]) {
    expect(release[key]).toMatch(/^sha256:[0-9a-f]{64}$/);
  }

  if (language === "es-MX") {
    await activateWithKeyboard(page, page.getByRole("button", { name: "Cambiar a español de México" }));
    await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();
  }
  await expect(page.locator("html")).toHaveAttribute("lang", language);
  await expect(page.locator(".fw-destination-grid .fw-destination")).toHaveCount(14);
  await expect(page.locator(".fw-destination-grid .fw-destination:not(.nico-world-destination)")).toHaveCount(13);
  await expect(page.locator(".nico-world-destination")).toHaveCount(1);
  const lockedValley = page.locator(".fw-destination.is-locked").filter({ hasText: text.dinosaur });
  await expect(lockedValley).toBeDisabled();
  await assertLayout(page, `${testInfo.project.name} initial map`);

  await activateWithKeyboard(page, page.getByRole("button", { name: text.begin, exact: true }));
  await expect(page.getByRole("heading", { name: text.roboLab, exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { name: text.configure, exact: true })).toBeVisible();
  const repairArms = page.locator("select").filter({ has: page.locator('option[value="Tool Arms"]') });
  await expect(repairArms).toHaveCount(1);
  await repairArms.selectOption("Tool Arms");
  await activateWithKeyboard(page, page.getByRole("button", { name: text.useRobot, exact: true }));
  await expect(page.getByRole("heading", { name: text.movement, exact: true })).toBeFocused();
  await assertRendererReady(page, expectsReducedMotion);

  await page.getByRole("button", { name: text.forward, exact: true }).click();
  await page.getByRole("button", { name: text.right, exact: true }).click();
  await page.getByRole("button", { name: text.forward, exact: true }).click();
  await activateWithKeyboard(page, page.getByRole("button", { name: text.passMovement, exact: true }));
  await expect(page.getByRole("heading", { name: text.scanner, exact: true })).toBeFocused();

  await page.getByRole("button", { name: new RegExp(text.socket) }).click();
  await activateWithKeyboard(page, page.getByRole("button", { name: text.passScanner, exact: true }));
  await expect(page.getByRole("heading", { name: text.logic, exact: true })).toBeFocused();

  await page.getByRole("button", { name: new RegExp(`${text.star}$`) }).click();
  await activateWithKeyboard(page, page.getByRole("button", { name: text.completeChamber, exact: true }));
  await activateWithKeyboard(page, page.getByRole("button", { name: text.returnMap, exact: true }));
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();

  await activateWithKeyboard(page, page.getByRole("button", { name: text.travelBridge, exact: true }));
  await assertRendererReady(page, expectsReducedMotion);
  await page.getByRole("button", { name: new RegExp(text.darkSocket) }).click();
  await activateWithKeyboard(page, page.getByRole("button", { name: text.confirmFault, exact: true }));
  await expect(page.getByRole("heading", { name: /Star Core|Núcleo Estelar/ })).toBeFocused();

  await page.getByRole("button", { name: text.align, exact: true }).click();
  await page.getByRole("button", { name: text.lock, exact: true }).click();
  await page.getByRole("button", { name: text.charge, exact: true }).click();
  await activateWithKeyboard(page, page.getByRole("button", { name: text.install, exact: true }));
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.activate) }));
  await expect(page.getByRole("heading", { name: text.bridgeComplete, exact: true })).toBeFocused();
  await expect(page.locator(".broken-bridge")).toHaveClass(/is-restored/);
  await expect(page.locator(".bridge-achievement strong")).toHaveText(text.achievement);
  await assertLayout(page, `${testInfo.project.name} restored bridge`);
  await testInfo.attach("restored-bridge", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  const goldenAssetUrls = await page.evaluate(() => [...new Set([
    "/",
    ...performance.getEntriesByType("resource")
      .map((entry) => new URL(entry.name))
      .filter((url) => url.origin === window.location.origin)
      .map((url) => `${url.pathname}${url.search}`),
  ])]);

  await activateWithKeyboard(page, page.getByRole("button", { name: text.bridgeReturn, exact: true }).last());
  await expect(page.getByText(text.restoredStatus, { exact: true })).toBeVisible();
  const unlockedValley = page.locator(".fw-destination").filter({ hasText: text.dinosaur });
  await expect(unlockedValley).toBeEnabled();
  await activateWithKeyboard(page, unlockedValley);
  await expect(page.getByRole("heading", { name: text.dinosaur, exact: true })).toBeFocused();

  await activateWithKeyboard(page, page.locator(".fw-brand"));
  await openDestination(page, text.museum);
  const achievementEntry = page.locator(".memory-entry-grid button").filter({ hasText: text.achievement });
  await expect(achievementEntry).toHaveCount(1);
  await page.reload();
  await expect(achievementEntry).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("lang", language);

  const background = await context.newPage();
  await background.goto("about:blank");
  await page.bringToFront();
  await expect(achievementEntry).toHaveCount(1);
  await background.close();

  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 20_000 }).toBe(true);
  await context.setOffline(true);
  const offlineAssets = await page.evaluate(async (urls) => Promise.all(urls.map(async (url) => {
    try {
      const response = await fetch(url);
      return { url, ok: response.ok };
    } catch {
      return { url, ok: false };
    }
  })), goldenAssetUrls);
  expect(offlineAssets.filter((asset) => !asset.ok), "Golden Adventure assets unavailable offline").toEqual([]);
  await expect(achievementEntry).toHaveCount(1);
  await context.setOffline(false);

  if (testInfo.project.name === "chromium-desktop-en") {
    await activateWithKeyboard(page, page.locator(".fw-brand"));
    await activateWithKeyboard(page, page.getByRole("button", { name: /Open destination: Parent & Settings/ }));
    await expect(page.getByRole("heading", { name: text.settings, exact: true })).toBeFocused();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: text.backup, exact: true }).click();
    const download = await downloadPromise;
    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();
    await page.evaluate(() => localStorage.removeItem("nicos-world-local-save-v4"));
    await page.reload();
    await activateWithKeyboard(page, page.getByRole("button", { name: /Open destination: Parent & Settings/ }));
    await page.locator('input[type="file"]').setInputFiles(backupPath!);
    await expect(page.getByText(text.restoreSuccess, { exact: true })).toBeVisible();
    await activateWithKeyboard(page, page.locator(".fw-brand"));
    await expect(page.getByText(text.restoredStatus, { exact: true })).toBeVisible();
  }

  await assertLayout(page, `${testInfo.project.name} final state`);
  await testInfo.attach("final-state", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  expect([...new Set(externalRequests)]).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

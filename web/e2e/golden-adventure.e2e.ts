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
    atlas: "A whole world is waking up",
    atlasInstructions: "Choose a landmark below. No dragging or time limit.",
    animalForest: "Animal Forest",
    animalTrail: "Choose a living habitat trail",
    animalUnavailable: "The illustrated forest is unavailable. Choose a habitat below.",
    monsterLab: "Monster Lab",
    monsterStudio: "Sculpt a creature you can see",
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
    overlook: "Follow the gentle giant",
    footprints: "Read the footprints",
    canopy: "Inspect the canopy",
    herdPath: "Watch the herd path",
    dinosaurFound: "Brachiosaurus found!",
    fossilExpedition: "Survey the fossil layer",
    fossilLayer: "Fern-imprint shale",
    brushEdge: "Brush outer ridge",
    brushVertebra: "Brush vertebra",
    brushLeg: "Brush leg bone",
    jurassic: "Jurassic",
    fossilComplete: "Brachiosaurus discovered!",
  },
  "es-MX": {
    world: "Mapa del mundo",
    atlas: "Todo un mundo está despertando",
    atlasInstructions: "Elige un lugar abajo. No necesitas arrastrar ni tienes límite de tiempo.",
    animalForest: "Bosque animal",
    animalTrail: "Elige un sendero de hábitat viviente",
    animalUnavailable: "El bosque ilustrado no está disponible. Elige un hábitat abajo.",
    monsterLab: "Laboratorio de monstruos",
    monsterStudio: "Esculpe una criatura que puedas ver",
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
    overlook: "Sigue al gigante tranquilo",
    footprints: "Lee las huellas",
    canopy: "Inspecciona las copas",
    herdPath: "Observa el sendero de la manada",
    dinosaurFound: "¡Brachiosaurus encontrado!",
    fossilExpedition: "Examina la capa fósil",
    fossilLayer: "Lutita con impresiones de helechos",
    brushEdge: "Cepillar el borde",
    brushVertebra: "Cepillar la vértebra",
    brushLeg: "Cepillar el hueso de la pata",
    jurassic: "Jurásico",
    fossilComplete: "¡Brachiosaurus descubierto!",
  },
} as const;

async function activateWithKeyboard(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.scrollIntoViewIfNeeded();
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

test("Living destinations keep their navigation without WebGL", async ({ page }, testInfo) => {
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(this: HTMLCanvasElement, contextId: string, options?: unknown) {
      if (contextId === "webgl" || contextId === "webgl2" || contextId === "experimental-webgl") return null;
      return originalGetContext.call(this, contextId as "2d", options as CanvasRenderingContext2DSettings);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  await page.goto("/");
  await waitForServiceWorkerControl(page);
  if (language === "es-MX") {
    await activateWithKeyboard(page, page.getByRole("button", { name: "Cambiar a español de México" }));
  }
  const atlas = page.locator(".world-atlas");
  await expect(atlas).toHaveAttribute("data-world-renderer", "illustrated-2d");
  const illustratedMap = atlas.locator('.world-atlas-illustration__art[data-map-art="premium-storybook"]');
  await expect(illustratedMap).toBeVisible();
  await expect(illustratedMap.locator("img")).toBeVisible();
  await expect(illustratedMap.locator("img")).toHaveJSProperty("complete", true);
  await expect(atlas.locator(".world-atlas-illustration")).toHaveAttribute("data-valley-status", "locked");
  await expect(atlas.locator("figcaption")).toHaveText(text.atlasInstructions);
  await expect(atlas.locator("canvas")).toHaveCount(0);
  await expect(atlas.locator(".game-canvas")).toHaveCount(0);
  await expect(atlas.locator(".world-atlas__landmark")).toHaveCount(6);
  await expect(atlas.locator(".world-atlas__landmark").filter({ hasText: text.roboLab })).toBeEnabled();
  await expect(atlas.locator(".world-atlas__landmark").filter({ hasText: text.dinosaur })).toBeDisabled();
  await assertLayout(page, `${testInfo.project.name} no-WebGL atlas fallback`);

  await openDestination(page, text.animalForest);
  await expect(page.getByRole("heading", { name: text.animalTrail, exact: true })).toBeVisible();
  const forest = page.locator(".animal-forest-trail");
  await expect(forest).toHaveAttribute("data-habitat-renderer", "premium-2d");
  await expect(forest.locator('.animal-forest-illustration__art[data-habitat-art="Jungle"]')).toBeVisible();
  await expect(forest.locator("canvas")).toHaveCount(0);
  await expect(forest.locator(".game-canvas")).toHaveCount(0);
  await expect(forest.locator(".animal-forest-trail__habitat")).toHaveCount(10);
  const ocean = forest.locator('.animal-forest-trail__habitat[data-habitat="Ocean"]');
  await activateWithKeyboard(page, ocean);
  await expect(ocean).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".fw-creature-card")).toHaveCount(4);
  await expect(page.locator(".fw-creature-card .local-wildlife-art")).toHaveCount(4);
  await expect(page.locator(".fw-creature-card img")).toHaveCount(0);
  await assertLayout(page, `${testInfo.project.name} no-WebGL Animal Forest fallback`);
});

test("Golden Adventure passes the production browser matrix", async ({ page, context }, testInfo) => {
  test.setTimeout(240_000);
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
  await expect(page.getByRole("heading", { name: text.atlas, exact: true })).toBeVisible();
  await expect(page.locator(".world-atlas")).toHaveAttribute("data-world-renderer", "illustrated-2d");
  const atlasArt = page.locator('.world-atlas-illustration__art[data-map-art="premium-storybook"] img');
  await expect(atlasArt).toBeVisible();
  await expect(atlasArt).toHaveJSProperty("complete", true);
  await expect(page.locator(".world-atlas canvas")).toHaveCount(0);
  await expect(page.locator(".world-atlas__landmark")).toHaveCount(6);
  const lockedAtlasValley = page.locator(".world-atlas__landmark.is-locked").filter({ hasText: text.dinosaur });
  await expect(lockedAtlasValley).toBeDisabled();
  await expect(page.locator(".fw-destination-grid .fw-destination")).toHaveCount(16);
  await expect(page.locator(".fw-destination-grid .fw-destination:not(.nico-world-destination)")).toHaveCount(15);
  await expect(page.locator(".nico-world-destination")).toHaveCount(1);
  const lockedValley = page.locator(".fw-destination.is-locked").filter({ hasText: text.dinosaur });
  await expect(lockedValley).toBeDisabled();
  await assertLayout(page, `${testInfo.project.name} initial map`);
  await testInfo.attach("living-world-atlas-locked", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });

  await openDestination(page, text.animalForest);
  await expect(page.getByRole("heading", { name: text.animalForest, exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { name: text.animalTrail, exact: true })).toBeVisible();
  const premiumForest = page.locator('.animal-forest-trail[data-habitat-renderer="premium-2d"]');
  await expect(premiumForest).toBeVisible();
  await expect(premiumForest.locator('.animal-forest-illustration__art[data-habitat-art="Jungle"]')).toBeVisible();
  await expect(premiumForest.locator("canvas")).toHaveCount(0);
  const habitatButtons = page.locator(".animal-forest-trail__habitat");
  await expect(habitatButtons).toHaveCount(10);
  const ocean = page.locator('.animal-forest-trail__habitat[data-habitat="Ocean"]');
  await expect(ocean).toHaveCount(1);
  await activateWithKeyboard(page, ocean);
  await expect(ocean).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".fw-creature-card")).toHaveCount(4);
  await expect(page.locator(".fw-creature-card .local-wildlife-art")).toHaveCount(4);
  await expect(page.locator(".fw-creature-card img")).toHaveCount(0);
  await assertLayout(page, `${testInfo.project.name} Animal Forest`);
  await testInfo.attach("private-animal-forest", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  await activateWithKeyboard(page, page.locator(".fw-brand"));
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();

  await openDestination(page, text.monsterLab);
  await expect(page.getByRole("heading", { name: text.monsterLab, exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { name: text.monsterStudio, exact: true })).toBeVisible();
  await expect(page.locator(".monster-studio__trait")).toHaveCount(12);
  await expect(page.locator('.monster-studio__trait[data-trait="eyes"], .monster-studio__trait[data-trait="mouth"], .monster-studio__trait[data-trait="horns"]')).toHaveCount(0);
  const premiumMonster = page.locator('.monster-v2[data-monster-body-art="Dragon"]');
  await expect(premiumMonster).toBeVisible();
  await expect(premiumMonster.locator(".monster-premium-body__art")).toBeVisible();
  await expect(premiumMonster.locator("canvas")).toHaveCount(0);
  const colorTrait = page.locator('.monster-studio__trait[data-trait="color"]');
  await activateWithKeyboard(page, colorTrait);
  const crimson = page.locator('.monster-studio__choice[data-option="Crimson"]');
  await activateWithKeyboard(page, crimson);
  await expect(crimson).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.locator(".monster-stage").evaluate((element) => getComputedStyle(element).getPropertyValue("--monster-main").trim()))
    .toBe("#be123c");
  await activateWithKeyboard(page, page.locator('.monster-studio__trait[data-trait="body"]'));
  const cosmic = page.locator('.monster-studio__choice[data-option="Cosmic"]');
  await activateWithKeyboard(page, cosmic);
  await expect(cosmic).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".monster-v2")).toHaveClass(/monster-family--cosmic/);
  await expect(page.locator(".monster-v2")).toHaveAttribute("data-monster-body-art", "Cosmic");
  await activateWithKeyboard(page, page.locator('.monster-studio__trait[data-trait="body"]'));
  const alien = page.locator('.monster-studio__choice[data-option="Alien"]');
  await activateWithKeyboard(page, alien);
  await expect(alien).toHaveAttribute("aria-pressed", "true");
  const alienMonster = page.locator('.monster-v2[data-monster-body-art="Alien"]');
  await expect(alienMonster).toBeVisible();
  await expect(alienMonster).toHaveAttribute("data-monster-face-treatment", "integrated-visor");
  const alienFit = await alienMonster.evaluate((element) => {
    const body = element.querySelector<HTMLElement>(".monster-premium-body")!.getBoundingClientRect();
    const face = element.querySelector<SVGGElement>(".monster-face")!.getBoundingClientRect();
    const horns = element.querySelector<SVGGElement>(".monster-horns")?.getBoundingClientRect();
    const core = element.querySelector<SVGGElement>(".monster-core")!.getBoundingClientRect();
    return {
      faceWidthRatio: face.width / body.width,
      faceTop: face.top - body.top,
      faceBottom: face.bottom - body.top,
      hornWidthRatio: horns ? horns.width / body.width : 0,
      coreWidthRatio: core.width / body.width,
    };
  });
  expect(alienFit.faceWidthRatio).toBeLessThan(0.35);
  expect(alienFit.faceTop).toBeGreaterThanOrEqual(0);
  expect(alienFit.faceBottom).toBeLessThan(210);
  expect(alienFit.hornWidthRatio).toBeLessThan(0.3);
  expect(alienFit.coreWidthRatio).toBeLessThan(0.2);
  await assertLayout(page, `${testInfo.project.name} Monster Lab`);
  await testInfo.attach("visual-alien-monster-lab", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  await activateWithKeyboard(page, page.locator(".fw-brand"));
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();

  await activateWithKeyboard(page, page.getByRole("button", { name: text.begin, exact: true }));
  await expect(page.getByRole("heading", { name: text.roboLab, exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { name: text.configure, exact: true })).toBeVisible();
  const repairArms = page.locator('.robot-assembly__choice[data-option="Tool Arms"]');
  await expect(repairArms).toHaveCount(1);
  await repairArms.click();
  await expect(repairArms).toHaveAttribute("aria-pressed", "true");
  await activateWithKeyboard(page, page.getByRole("button", { name: text.useRobot, exact: true }));
  await expect(page.getByRole("heading", { name: text.movement, exact: true })).toBeFocused();
  const illustratedBoltBot = page.locator('.boltbot-illustrated-chamber[data-renderer="premium-2d"]');
  await expect(illustratedBoltBot).toBeVisible();
  await expect(illustratedBoltBot.locator('[data-boltbot-renderer="premium-2d"]')).toHaveCount(1);
  await expect(page.locator(".boltbot-mission canvas")).toHaveCount(0);

  await page.getByRole("button", { name: text.forward, exact: true }).click();
  await expect(page.locator(".boltbot-mission")).toHaveAttribute("data-route-motion", expectsReducedMotion ? "reduced" : "moving");
  await page.getByRole("button", { name: text.right, exact: true }).click();
  await page.getByRole("button", { name: text.forward, exact: true }).click();
  await expect(page.locator(".boltbot-mission")).toHaveAttribute("data-route-motion", expectsReducedMotion ? "reduced" : "settled", { timeout: 20_000 });
  await testInfo.attach("boltbot-route-settled", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
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
  await activateWithKeyboard(page, page.getByRole("button", { name: text.bridgeReturn, exact: true }).last());
  await expect(page.getByText(text.restoredStatus, { exact: true })).toBeVisible();
  const unlockedAtlasValley = page.locator(".world-atlas__landmark").filter({ hasText: text.dinosaur });
  await expect(unlockedAtlasValley).toBeEnabled();
  await expect(page.locator(".world-atlas")).toHaveAttribute("data-valley-status", "open");
  await expect.poll(() => page.locator(".world-atlas-illustration img").evaluate((image: HTMLImageElement) => image.currentSrc))
    .toContain("nicos-world-map-restored");
  const unlockedValley = page.locator(".fw-destination").filter({ hasText: text.dinosaur });
  await expect(unlockedValley).toBeEnabled();
  await activateWithKeyboard(page, unlockedValley);
  await expect(page.getByRole("heading", { name: text.dinosaur, exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { name: text.overlook, exact: true })).toBeVisible();
  const premiumOverlook = page.locator('.dino-overlook[data-dinosaur-renderer="premium-2d"]');
  await expect(premiumOverlook).toBeVisible();
  await expect(premiumOverlook.locator("canvas")).toHaveCount(0);
  await expect(premiumOverlook.locator(".game-canvas")).toHaveCount(0);
  await expect(premiumOverlook.locator(".dino-overlook__art")).toHaveAttribute("data-dinosaur-overlook-stage", "0");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.footprints) }));
  await expect(premiumOverlook.locator(".dino-overlook__art")).toHaveAttribute("data-dinosaur-overlook-stage", "1");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.canopy) }));
  await expect(premiumOverlook.locator(".dino-overlook__art")).toHaveAttribute("data-dinosaur-overlook-stage", "2");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.herdPath) }));
  await expect(premiumOverlook.locator(".dino-overlook__art")).toHaveAttribute("data-dinosaur-overlook-stage", "3");
  await expect(page.getByText(text.dinosaurFound, { exact: true })).toBeVisible();
  await expect(page.locator(".dino-overlook__reveal")).toBeFocused();
  await expect(page.locator(".fw-skip-link")).toHaveCSS("opacity", "0");
  const dinosaurCards = page.locator(".fw-dino-card .dinosaur-art__scene");
  for (let index = 0; index < await dinosaurCards.count(); index += 1) {
    const framing = await dinosaurCards.nth(index).evaluate((scene) => {
      const creature = scene.querySelector<HTMLElement>(".dinosaur-art__creature");
      const sceneBox = scene.getBoundingClientRect();
      const creatureBox = creature?.getBoundingClientRect();
      return creatureBox ? {
        leftInset: creatureBox.left - sceneBox.left,
        rightInset: sceneBox.right - creatureBox.right,
        widthRatio: creatureBox.width / sceneBox.width,
      } : null;
    });
    expect(framing, `dinosaur card ${index + 1} should have creature art`).not.toBeNull();
    expect(framing!.leftInset, `dinosaur card ${index + 1} left edge`).toBeGreaterThanOrEqual(-2);
    expect(framing!.rightInset, `dinosaur card ${index + 1} right edge`).toBeGreaterThanOrEqual(-2);
    expect(framing!.widthRatio, `dinosaur card ${index + 1} width`).toBeLessThanOrEqual(1);
  }
  await assertLayout(page, `${testInfo.project.name} dinosaur overlook`);
  await testInfo.attach("dinosaur-overlook", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  const brachiosaurusCard = page.locator('.fw-dino-card[data-dinosaur-id="brachiosaurus"]');
  await activateWithKeyboard(page, brachiosaurusCard.getByRole("button"));
  await expect(page.getByRole("heading", { name: text.fossilExpedition, exact: true })).toBeFocused();
  const premiumFossil = page.locator('.fossil-expedition[data-dinosaur-renderer="premium-2d"]');
  await expect(premiumFossil).toBeVisible();
  await expect(premiumFossil.locator("canvas")).toHaveCount(0);
  await expect(premiumFossil.locator(".game-canvas")).toHaveCount(0);
  await expect(premiumFossil.locator(".fossil-expedition__art")).toHaveAttribute("data-fossil-stage", "survey");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.fossilLayer) }));
  await expect(premiumFossil.locator(".fossil-expedition__art")).toHaveAttribute("data-fossil-stage", "brush");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.brushEdge) }));
  await expect(premiumFossil.locator(".fossil-expedition__art")).toHaveAttribute("data-brushed-zones", "1");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.brushVertebra) }));
  await expect(premiumFossil.locator(".fossil-expedition__art")).toHaveAttribute("data-brushed-zones", "2");
  await activateWithKeyboard(page, page.getByRole("button", { name: new RegExp(text.brushLeg) }));
  await expect(premiumFossil.locator(".fossil-expedition__art")).toHaveAttribute("data-fossil-stage", "classify");
  await activateWithKeyboard(page, page.getByRole("button", { name: text.jurassic, exact: true }));
  await expect(page.getByRole("heading", { name: text.fossilComplete, exact: true })).toBeFocused();
  await expect(premiumFossil.locator(".fossil-expedition__art")).toHaveAttribute("data-fossil-stage", "complete");
  await assertLayout(page, `${testInfo.project.name} Brachiosaurus fossil expedition`);
  await testInfo.attach("brachiosaurus-fossil-expedition", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  const goldenAssetUrls = await page.evaluate(() => [...new Set([
    "/",
    ...performance.getEntriesByType("resource")
      .map((entry) => new URL(entry.name))
      .filter((url) => url.origin === window.location.origin && url.pathname !== "/sw.js")
      .map((url) => `${url.pathname}${url.search}`),
  ])]);

  await activateWithKeyboard(page, page.locator(".fw-brand"));
  await openDestination(page, text.museum);
  const achievementEntry = page.locator(".memory-entry-grid button").filter({ hasText: text.achievement });
  const brachiosaurusMemories = page.locator(".memory-entry-grid button").filter({ hasText: "Brachiosaurus" });
  await expect(achievementEntry).toHaveCount(1);
  await expect(brachiosaurusMemories).toHaveCount(2);
  await page.reload();
  await expect(achievementEntry).toHaveCount(1);
  await expect(brachiosaurusMemories).toHaveCount(2);
  await expect(page.locator("html")).toHaveAttribute("lang", language);

  const background = await context.newPage();
  await background.goto("about:blank");
  await page.bringToFront();
  await expect(achievementEntry).toHaveCount(1);
  await background.close();

  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 20_000 }).toBe(true);
  await context.setOffline(true);
  const offlineAssets = await page.evaluate(async (urls) => Promise.all(urls.map(async (url) => ({
    url,
    ok: Boolean(await caches.match(url, { ignoreSearch: true, ignoreVary: true })),
  }))), goldenAssetUrls);
  expect(offlineAssets.filter((asset) => !asset.ok), "Golden Adventure assets unavailable offline").toEqual([]);
  await expect(achievementEntry).toHaveCount(1);
  await context.setOffline(false);

  if (testInfo.project.name === "chromium-desktop-en") {
    await activateWithKeyboard(page, page.locator(".fw-brand"));
    await activateWithKeyboard(page, page.getByRole("button", { name: /Open destination: Parent & Settings/ }));
    await expect(page.getByRole("heading", { name: text.settings, exact: true })).toBeFocused();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: new RegExp(`${text.backup}$`) }).click();
    const download = await downloadPromise;
    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();
    await page.evaluate(() => localStorage.removeItem("nicos-world-local-save-v4"));
    await page.reload();
    await activateWithKeyboard(page, page.getByRole("button", { name: /Open destination: Parent & Settings/ }));
    await page.locator('input[type="file"]').setInputFiles(backupPath!);
    await expect(page.locator(".settings-status")).toHaveText(text.restoreSuccess);
    await activateWithKeyboard(page, page.locator(".fw-brand"));
    await expect(page.getByText(text.restoredStatus, { exact: true })).toBeVisible();
    await openDestination(page, text.museum);
    await expect(brachiosaurusMemories).toHaveCount(2);
  }

  await assertLayout(page, `${testInfo.project.name} final state`);
  await testInfo.attach("final-state", {
    body: await page.screenshot({ fullPage: true, animations: "disabled" }),
    contentType: "image/png",
  });
  expect([...new Set(externalRequests)]).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

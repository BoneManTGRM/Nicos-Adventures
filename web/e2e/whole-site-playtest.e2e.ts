import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

type Language = "en" | "es-MX";

const copy = {
  en: {
    world: "World Map",
    roboLab: "Robo Lab",
    animalForest: "Animal Forest",
    monsterLab: "Monster Lab",
    monsterHabitats: "Monster Habitats",
    artStudio: "Art Studio",
    storyCastle: "Story Castle",
    arcade: "Game Arcade",
    dinosaurValley: "Dinosaur Valley",
    petWorkshop: "Robot Pet Workshop",
    robotHome: "Robot Home",
    museum: "Memory Museum",
    badges: "Badge Observatory",
    settings: "Parent & Settings",
    switchLanguage: "Cambiar a español de México",
    saveRobot: "Save robot",
    saveMonster: "Save monster",
    feed: "Feed",
    title: "Title",
    saveArtwork: "Save artwork",
    saveStory: "Save story",
    savePet: "Save pet",
    searchMemories: "Search memories…",
    monsterMaker: "Monster Maker",
    renameProfile: "Rename profile",
    saveName: "Save name",
    backup: "Download backup",
    restore: "Restore backup",
  },
  "es-MX": {
    world: "Mapa del mundo",
    roboLab: "Laboratorio robot",
    animalForest: "Bosque animal",
    monsterLab: "Laboratorio de monstruos",
    monsterHabitats: "Hábitats de monstruos",
    artStudio: "Estudio de arte",
    storyCastle: "Castillo de cuentos",
    arcade: "Sala de juegos",
    dinosaurValley: "Valle de dinosaurios",
    petWorkshop: "Taller de mascotas robot",
    robotHome: "Casa Robot",
    museum: "Museo de recuerdos",
    badges: "Observatorio de insignias",
    settings: "Adultos y ajustes",
    switchLanguage: "Cambiar a español de México",
    saveRobot: "Guardar robot",
    saveMonster: "Guardar monstruo",
    feed: "Alimentar",
    title: "Título",
    saveArtwork: "Guardar obra",
    saveStory: "Guardar cuento",
    savePet: "Guardar mascota",
    searchMemories: "Buscar recuerdos…",
    monsterMaker: "Creador de monstruos",
    renameProfile: "Cambiar nombre",
    saveName: "Guardar nombre",
    backup: "Descargar respaldo",
    restore: "Restaurar respaldo",
  },
} as const;

const visualProjects = new Set(["chromium-desktop-en", "webkit-iphone-es"]);

async function activateWithKeyboard(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.scrollIntoViewIfNeeded();
  await locator.press("Enter");
}

async function assertPageChrome(page: Page, title: string, label: string) {
  const heading = page.getByRole("heading", { name: title, exact: true });
  await expect(heading).toBeFocused();
  const metrics = await page.evaluate(() => {
    const topbar = document.querySelector<HTMLElement>(".fw-topbar")?.getBoundingClientRect();
    const pageTitle = document.querySelector<HTMLElement>("#page-title")?.getBoundingClientRect();
    const bottomNavigation = document.querySelector<HTMLElement>(".fw-bottom-nav")?.getBoundingClientRect();
    return {
      bodyWidth: document.body.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      headerBottom: topbar?.bottom ?? 0,
      titleTop: pageTitle?.top ?? -1,
      navigationBottom: bottomNavigation?.bottom ?? 0,
      navigationTop: bottomNavigation?.top ?? 0,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.alt || image.currentSrc),
    };
  });
  expect(metrics.scrollY, `${label}: route did not reset scroll`).toBeLessThanOrEqual(2);
  expect(metrics.titleTop, `${label}: title is hidden by the sticky header`).toBeGreaterThanOrEqual(metrics.headerBottom);
  expect(metrics.navigationTop, `${label}: bottom navigation covers the header`).toBeGreaterThan(metrics.headerBottom);
  expect(metrics.navigationBottom, `${label}: bottom navigation exceeds the safe viewport`).toBeLessThanOrEqual(metrics.viewportHeight);
  expect(metrics.documentWidth, `${label}: document overflow`).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.bodyWidth, `${label}: body overflow`).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.brokenImages, `${label}: broken images`).toEqual([]);
}

async function returnToMap(page: Page, worldTitle: string, label: string) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await activateWithKeyboard(page.locator(".fw-brand"));
  await assertPageChrome(page, worldTitle, `${label} return to map`);
}

async function openDestination(page: Page, worldTitle: string, destinationTitle: string, label: string) {
  if (!(await page.getByRole("heading", { name: worldTitle, exact: true }).isVisible().catch(() => false))) {
    await returnToMap(page, worldTitle, label);
  }
  const destination = page.locator(".fw-destination").filter({ hasText: destinationTitle });
  await expect(destination).toHaveCount(1);
  await activateWithKeyboard(destination);
  await assertPageChrome(page, destinationTitle, label);
}

async function attachVisual(page: Page, testInfo: TestInfo, name: string) {
  if (!visualProjects.has(testInfo.project.name)) return;
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  await testInfo.attach(`site-${name}`, {
    body: await page.screenshot({ animations: "disabled", quality: 68, type: "jpeg" }),
    contentType: "image/jpeg",
  });
}

test("all destinations keep their main local interactions working", async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];
  const runtimeErrors: string[] = [];
  const externalRequests: string[] = [];
  const robotName = `Atlas Bot ${language === "es-MX" ? "MX" : "EN"}`;
  const monsterName = `Nova ${language === "es-MX" ? "MX" : "EN"}`;
  const petName = `Sparky ${language === "es-MX" ? "MX" : "EN"}`;
  const artworkTitle = language === "es-MX" ? "Póster del sitio" : "Site Adventure Poster";
  const storyTitle = language === "es-MX" ? "La prueba del mundo" : "The World Test";
  const profileName = language === "es-MX" ? "Explorador QA" : "QA Explorer";

  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("request", (request) => {
    const target = new URL(request.url());
    if (target.protocol.startsWith("http") && target.origin !== "http://127.0.0.1:4173") externalRequests.push(target.origin);
  });

  await page.goto("/");
  if (language === "es-MX") {
    await activateWithKeyboard(page.getByRole("button", { name: text.switchLanguage }));
  }
  await expect(page.locator("html")).toHaveAttribute("lang", language);
  await expect(page.locator(".fw-destination-grid .fw-destination")).toHaveCount(14);
  await expect(page.locator(".fw-destination.is-locked").filter({ hasText: text.dinosaurValley })).toBeDisabled();
  await attachVisual(page, testInfo, "world-map");

  await openDestination(page, text.world, text.roboLab, `${testInfo.project.name} Robo Lab`);
  await page.locator(".robo-lab-identity input").fill(robotName);
  await page.getByRole("button", { name: new RegExp(`${text.saveRobot}$`) }).click();
  await expect(page.locator(".robo-lab-saved button").filter({ hasText: robotName })).toHaveCount(1);
  await attachVisual(page, testInfo, "robo-lab");

  await openDestination(page, text.world, text.animalForest, `${testInfo.project.name} Animal Forest`);
  const ocean = page.locator('.animal-forest-trail__habitat[data-habitat="Ocean"]');
  await activateWithKeyboard(ocean);
  const firstAnimal = page.locator(".fw-creature-card").first();
  await firstAnimal.locator(".fw-action-row button").first().click();
  await expect(firstAnimal).toHaveClass(/is-discovered/);
  await firstAnimal.locator(".fw-action-row button").nth(1).click();
  await expect(firstAnimal.locator(".fw-action-row button").nth(1)).toHaveAttribute("aria-pressed", "true");
  await attachVisual(page, testInfo, "animal-forest");

  await openDestination(page, text.world, text.monsterLab, `${testInfo.project.name} Monster Lab`);
  await page.locator(".monster-lab-name input").fill(monsterName);
  await page.getByRole("button", { name: new RegExp(`${text.saveMonster}$`) }).click();
  await expect(page.locator(".monster-collection button").filter({ hasText: monsterName })).toHaveCount(1);
  await expect(page.locator('[data-monster-body-art="Dragon"]')).toBeVisible();
  await attachVisual(page, testInfo, "monster-lab");

  await openDestination(page, text.world, text.monsterHabitats, `${testInfo.project.name} Monster Habitats`);
  const habitatCard = page.locator(".monster-habitat-card").filter({ hasText: monsterName });
  await expect(habitatCard).toHaveCount(1);
  await habitatCard.getByRole("button", { name: new RegExp(text.feed) }).click();
  await expect(habitatCard.locator("progress")).toHaveAttribute("value", "6");
  await attachVisual(page, testInfo, "monster-habitats");

  await openDestination(page, text.world, text.artStudio, `${testInfo.project.name} Art Studio`);
  await page.getByLabel(text.title, { exact: true }).fill(artworkTitle);
  await page.getByRole("button", { name: new RegExp(`${text.saveArtwork}$`) }).click();
  await expect(page.locator(".creative-library-grid h3").filter({ hasText: artworkTitle })).toHaveCount(1);
  await attachVisual(page, testInfo, "art-studio");

  await openDestination(page, text.world, text.storyCastle, `${testInfo.project.name} Story Castle`);
  await page.getByLabel(text.title, { exact: true }).fill(storyTitle);
  await page.getByRole("button", { name: new RegExp(`${text.saveStory}$`) }).click();
  await expect(page.locator(".creative-library-grid h3").filter({ hasText: storyTitle })).toHaveCount(1);
  await attachVisual(page, testInfo, "story-castle");

  await openDestination(page, text.world, text.arcade, `${testInfo.project.name} Game Arcade`);
  await page.locator(".fw-game-card button").first().click();
  await expect(page.locator(".arcade-challenge")).toBeVisible();
  await page.locator(".arcade-answer-grid button").first().click();
  await expect(page.locator(".arcade-feedback")).toBeVisible();
  await attachVisual(page, testInfo, "game-arcade");

  await openDestination(page, text.world, text.petWorkshop, `${testInfo.project.name} Pet Workshop`);
  await page.locator(".pet-workshop-layout .fw-panel input").fill(petName);
  await page.getByRole("button", { name: new RegExp(`${text.savePet}$`) }).click();
  await expect(page.locator(".fw-collection-row button").filter({ hasText: petName })).toHaveCount(1);
  const firstTrick = page.locator(".pet-trick-grid button").first();
  await firstTrick.click();
  await expect(firstTrick).toBeDisabled();
  await attachVisual(page, testInfo, "pet-workshop");

  await openDestination(page, text.world, text.robotHome, `${testInfo.project.name} Robot Home`);
  await expect(page.locator(".robot-home-stage")).toContainText(robotName);
  await expect(page.locator(".robot-home-stage")).toContainText(petName);
  await expect(page.locator(".robot-home-stage")).toContainText(artworkTitle);
  const artworkChoice = page.locator(".robot-home-choice-list button").filter({ hasText: artworkTitle });
  await artworkChoice.click();
  await expect(artworkChoice).toHaveAttribute("aria-pressed", "true");
  const decoration = page.locator(".robot-home-decoration-grid button").first();
  await decoration.click();
  await expect(decoration).toHaveAttribute("aria-pressed", "true");
  await attachVisual(page, testInfo, "robot-home");

  await openDestination(page, text.world, text.museum, `${testInfo.project.name} Memory Museum`);
  await page.getByPlaceholder(text.searchMemories).fill(monsterName);
  const monsterMemory = page.locator(".memory-entry-grid button").filter({ hasText: monsterName });
  await expect(monsterMemory).toHaveCount(1);
  await monsterMemory.click();
  await expect(page.locator(".memory-detail-panel h2")).toHaveText(monsterName);
  await attachVisual(page, testInfo, "memory-museum");

  await openDestination(page, text.world, text.badges, `${testInfo.project.name} Badge Observatory`);
  await expect(page.locator(".badge-progress-grid article")).toHaveCount(16);
  await expect(page.locator(".badge-progress-grid article").filter({ hasText: text.monsterMaker })).toHaveClass(/earned/);
  await attachVisual(page, testInfo, "badge-observatory");

  await openDestination(page, text.world, text.settings, `${testInfo.project.name} Parent & Settings`);
  await page.getByLabel(text.renameProfile, { exact: true }).fill(profileName);
  await page.getByRole("button", { name: text.saveName, exact: true }).click();
  await expect(page.locator(".fw-profile-pill").first()).toContainText(profileName);
  await expect(page.getByRole("button", { name: new RegExp(`${text.backup}$`) })).toBeEnabled();
  await expect(page.getByRole("button", { name: new RegExp(`${text.restore}$`) })).toBeEnabled();
  await attachVisual(page, testInfo, "parent-settings");

  await page.reload();
  await expect(page.getByRole("heading", { name: text.settings, exact: true })).toBeVisible();
  await expect(page.locator(".fw-profile-pill").first()).toContainText(profileName);
  await openDestination(page, text.world, text.museum, `${testInfo.project.name} persisted Memory Museum`);
  await page.getByPlaceholder(text.searchMemories).fill(storyTitle);
  await expect(page.locator(".memory-entry-grid button").filter({ hasText: storyTitle })).toHaveCount(1);

  expect([...new Set(externalRequests)]).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

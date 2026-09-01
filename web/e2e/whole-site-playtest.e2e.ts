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
    guide: "Meet Nico, your local adventure guide",
    askNico: "Ask Nico",
    clubhouse: "Nico’s Clubhouse",
    closeClubhouse: "Close Nico’s Clubhouse",
    wardrobe: "Wardrobe",
    wardrobeTitle: "Nico’s Real Wardrobe",
    suggestion: "What can I do here?",
    saveWardrobe: "Save Nico’s wardrobe",
    wardrobeSaved: "Wardrobe saved",
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
    guide: "Conoce a Nico, tu guía local de aventuras",
    askNico: "Pregúntale a Nico",
    clubhouse: "Casa Club de Nico",
    closeClubhouse: "Cerrar la Casa Club de Nico",
    wardrobe: "Guardarropa",
    wardrobeTitle: "El guardarropa real de Nico",
    suggestion: "¿Qué puedo hacer aquí?",
    saveWardrobe: "Guardar el guardarropa de Nico",
    wardrobeSaved: "Guardarropa guardado",
  },
} as const;

const visualProjects = new Set(["chromium-desktop-en", "webkit-iphone-es"]);

async function activateWithKeyboard(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.press("Enter");
}

async function assertPageChrome(page: Page, title: string, label: string, expectFocus = true) {
  const heading = page.getByRole("heading", { name: title, exact: true });
  if (expectFocus) await expect(heading).toBeFocused();
  else await expect(heading).toBeVisible();
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
      overflowingElements: [...document.body.querySelectorAll<HTMLElement>("*")]
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.right > document.documentElement.clientWidth + 2 || bounds.left < -2;
        })
        .slice(0, 8)
        .map((element) => `${element.tagName.toLowerCase()}.${element.className}`),
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.alt || image.currentSrc),
    };
  });
  expect(metrics.scrollY, `${label}: route did not reset scroll`).toBeLessThanOrEqual(2);
  expect(metrics.titleTop, `${label}: title is hidden by the sticky header`).toBeGreaterThanOrEqual(metrics.headerBottom);
  expect(metrics.navigationTop, `${label}: bottom navigation covers the header`).toBeGreaterThan(metrics.headerBottom);
  expect(metrics.navigationBottom, `${label}: bottom navigation exceeds the safe viewport`).toBeLessThanOrEqual(metrics.viewportHeight);
  expect(metrics.documentWidth, `${label}: document overflow (${metrics.overflowingElements.join(", ")})`).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.bodyWidth, `${label}: body overflow (${metrics.overflowingElements.join(", ")})`).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.brokenImages, `${label}: broken images`).toEqual([]);
}

async function returnToMap(page: Page, worldTitle: string, label: string) {
  const canScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 2);
  if (canScroll) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  }
  await activateWithKeyboard(page.locator(".fw-brand"));
  await assertPageChrome(page, worldTitle, `${label} return to map`);
}

async function openDestination(page: Page, worldTitle: string, destinationTitle: string, label: string) {
  if (!(await page.getByRole("heading", { name: worldTitle, exact: true }).isVisible().catch(() => false))) {
    await returnToMap(page, worldTitle, label);
  }
  const destination = page.locator(".fw-destination-grid > .fw-destination").filter({
    has: page.getByText(destinationTitle, { exact: true }),
  });
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

async function assertWardrobeCardLayout(page: Page, label: string) {
  const cards = page.locator(".wardrobe-garment-grid > button");
  await expect(cards.first()).toBeVisible();
  const overlaps = await cards.evaluateAll((buttons) => buttons.slice(0, 4).flatMap((button, index) => {
    const art = button.querySelector<HTMLElement>(".wardrobe-garment-art")?.getBoundingClientRect();
    const name = button.querySelector<HTMLElement>("strong")?.getBoundingClientRect();
    const hint = button.querySelector<HTMLElement>("small")?.getBoundingClientRect();
    if (!art || !name || !hint) return [`card ${index + 1} is missing a content region`];
    const failures: string[] = [];
    if (name.top < art.bottom - 1) failures.push(`card ${index + 1} name overlaps its art`);
    if (hint.top < name.bottom - 1) failures.push(`card ${index + 1} hint overlaps its name`);
    if (hint.bottom > button.getBoundingClientRect().bottom + 1) failures.push(`card ${index + 1} content escapes its card`);
    return failures;
  }));
  expect(overlaps, label).toEqual([]);
}

test("keyboard route focus and viewport chrome stay stable", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];

  await page.goto("/");
  if (language === "es-MX") {
    await activateWithKeyboard(page.getByRole("button", { name: text.switchLanguage }));
  }
  await expect(page.locator("html")).toHaveAttribute("lang", language);

  await openDestination(page, text.world, text.roboLab, `${testInfo.project.name} focused Robo Lab`);
  await returnToMap(page, text.world, `${testInfo.project.name} focused map return`);
  await openDestination(page, text.world, text.storyCastle, `${testInfo.project.name} focused Story Castle`);
});

test("all destinations keep their main local interactions working", async ({ page }, testInfo) => {
  test.skip(
    !visualProjects.has(testInfo.project.name),
    "The full local-first journey runs on representative desktop English and iPhone Spanish; the Golden Adventure retains the complete eight-project matrix.",
  );
  test.setTimeout(600_000);
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];
  const runtimeErrors: string[] = [];
  const externalRequests: string[] = [];
  const robotName = "Nico's BoltBot";
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
  await expect(page.locator(".fw-destination-grid .fw-destination")).toHaveCount(16);
  await expect(page.locator(".fw-destination.is-locked").filter({ hasText: text.dinosaurValley })).toBeDisabled();
  await attachVisual(page, testInfo, "world-map");

  await openDestination(page, text.world, text.roboLab, `${testInfo.project.name} Robo Lab`);
  const robotMovements = page.locator(".robot-action-grid button");
  await expect(robotMovements).toHaveCount(6);
  await robotMovements.first().click();
  await expect(robotMovements.first()).toHaveAttribute("aria-pressed", "true");
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
  const chooseMonsterOption = async (trait: string, option: string) => {
    await page.locator(`.monster-studio__trait[data-trait="${trait}"]`).click();
    await page.locator(`.monster-studio__choice[data-option="${option}"]`).click();
  };
  await chooseMonsterOption("body", "Stone Golem");
  await chooseMonsterOption("wings", "Star wings");
  await chooseMonsterOption("tail", "Dragon tail");
  const fittedGolem = page.locator('[data-monster-body-art="Stone Golem"]');
  await expect(fittedGolem).toHaveAttribute("data-monster-face-treatment", "carved-golem");
  await expect(fittedGolem.locator(".monster-traits--rear")).toHaveCSS("z-index", "1");
  await expect(fittedGolem.locator(".monster-premium-body")).toHaveCSS("z-index", "2");
  await expect(fittedGolem.locator(".monster-traits--front")).toHaveCSS("z-index", "4");
  const fittedPartWidths = await fittedGolem.evaluate((element) => {
    const width = (selector: string) => element.querySelector<SVGGraphicsElement>(selector)?.getBoundingClientRect().width ?? 0;
    return {
      body: element.querySelector<HTMLElement>(".monster-premium-body")?.getBoundingClientRect().width ?? 0,
      face: width(".monster-face"),
      horns: width(".monster-horns"),
      wings: width(".monster-wings"),
    };
  });
  expect(fittedPartWidths.face).toBeLessThan(fittedPartWidths.body * 0.48);
  expect(fittedPartWidths.horns).toBeLessThan(fittedPartWidths.body * 0.5);
  expect(fittedPartWidths.wings).toBeLessThan(fittedPartWidths.body * 0.78);
  await attachVisual(page, testInfo, "monster-lab-stone-golem-fit");

  await chooseMonsterOption("body", "Alien");
  await chooseMonsterOption("arms", "Four arms");
  await page.locator(".monster-lab-name input").fill(monsterName);
  await page.getByRole("button", { name: new RegExp(`${text.saveMonster}$`) }).click();
  await expect(page.locator(".monster-collection button").filter({ hasText: monsterName })).toHaveCount(1);
  const premiumAlien = page.locator('[data-monster-body-art="Alien"][data-monster-arms-art="Four arms"]');
  await expect(premiumAlien).toBeVisible();
  await expect(premiumAlien).toHaveAttribute("data-monster-face-treatment", "integrated-visor");
  await expect(premiumAlien.locator(".monster-premium-body__art")).toHaveCSS("background-size", /400% 200%/);
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
  await page.getByLabel(language === "es-MX" ? "Tu detalle secreto (opcional)" : "Your secret detail (optional)").fill(language === "es-MX" ? "Un cometa morado dibujó una pista" : "A purple comet drew a clue");
  await expect(page.locator(".story-book-preview")).toHaveAttribute("data-page", "1-of-6");
  await page.getByRole("button", { name: language === "es-MX" ? /Siguiente/ : /Next/ }).click();
  await expect(page.locator(".story-book-preview")).toHaveAttribute("data-page", "2-of-6");
  await page.getByRole("button", { name: new RegExp(`${text.saveStory}$`) }).click();
  await expect(page.locator(".creative-library-grid h3").filter({ hasText: storyTitle })).toHaveCount(1);
  await expect(page.locator(".creative-library-grid article").filter({ hasText: storyTitle })).toContainText(language === "es-MX" ? "6 páginas" : "6 pages");
  await attachVisual(page, testInfo, "story-castle");

  await openDestination(page, text.world, text.arcade, `${testInfo.project.name} Game Arcade`);
  await page.locator(".arcade-featured-duel button").click();
  await expect(page.locator('.friendly-duel[data-duel-status="playing"]')).toBeVisible();
  for (const index of [0, 1, 2, 0, 1, 2]) await page.locator(".friendly-duel__controls button").nth(index).click();
  await expect(page.locator('.friendly-duel[data-duel-status="won"]')).toBeVisible();
  await expect(page.locator(".friendly-duel__finish")).toContainText(language === "es-MX" ? "amigo" : "friend");
  await attachVisual(page, testInfo, "friendly-duel");
  await page.locator(".friendly-duel__header > button").click();
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
  const decoration = page.locator('.robot-home-decoration-grid button[aria-pressed="false"]').first();
  await expect(decoration).toBeVisible();
  const decorationLabel = (await decoration.textContent())?.replace(/^[＋✓]\s*/, "").trim() ?? "";
  await decoration.click();
  await expect(page.locator('.robot-home-decoration-grid button[aria-pressed="true"]').filter({ hasText: decorationLabel })).toHaveCount(1);
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

  await activateWithKeyboard(page.getByRole("button", { name: text.guide }));
  await expect(page.locator("#nico-guide-panel")).toBeVisible();
  await page.getByRole("button", { name: new RegExp(`${text.askNico}$`) }).click();
  const clubhouse = page.getByRole("dialog", { name: text.clubhouse, exact: true });
  await expect(clubhouse).toBeVisible();
  await expect(page.getByRole("button", { name: text.closeClubhouse, exact: true })).toBeFocused();
  await page.getByRole("button", { name: text.suggestion, exact: true }).click();
  const answer = clubhouse.locator(".nico-chat-answer").last();
  await expect(answer).toBeVisible();
  await expect(answer).not.toHaveClass(/nico-chat-answer--fallback/);
  await attachVisual(page, testInfo, "clubhouse-ask-nico");

  await clubhouse.getByRole("button", { name: new RegExp(`${text.wardrobe}$`) }).click();
  await expect(page.getByRole("heading", { name: text.wardrobeTitle, exact: true })).toBeVisible();
  await expect(clubhouse.locator(".wardrobe-preset-row > button")).toHaveCount(26);
  await expect(clubhouse.locator('.wardrobe-slot-tabs [role="tab"]')).toHaveCount(9);
  await assertWardrobeCardLayout(page, `${testInfo.project.name}: wardrobe card layout`);
  await activateWithKeyboard(clubhouse.locator(".wardrobe-preset-row > button").nth(4));
  const selectedGarment = clubhouse.locator(".wardrobe-garment-grid > button").nth(1);
  const selectedGarmentName = await selectedGarment.locator("strong").innerText();
  await selectedGarment.click();
  await expect(selectedGarment).toHaveAttribute("aria-pressed", "true");
  await clubhouse.getByRole("button", { name: new RegExp(`${text.saveWardrobe}$`) }).click();
  await expect(clubhouse.getByRole("button", { name: new RegExp(`${text.wardrobeSaved}$`) })).toBeVisible();
  await attachVisual(page, testInfo, "clubhouse-wardrobe");
  await page.getByRole("button", { name: text.closeClubhouse, exact: true }).click();
  await expect(clubhouse).toBeHidden();

  const settingsCanScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 2);
  if (settingsCanScroll) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  }
  await page.reload();
  await assertPageChrome(page, text.settings, `${testInfo.project.name} persisted route reload`, false);
  await expect(page.locator(".fw-profile-pill").first()).toContainText(profileName);
  await openDestination(page, text.world, text.museum, `${testInfo.project.name} persisted Memory Museum`);
  await page.getByPlaceholder(text.searchMemories).fill(storyTitle);
  await expect(page.locator(".memory-entry-grid button").filter({ hasText: storyTitle })).toHaveCount(1);

  await activateWithKeyboard(page.getByRole("button", { name: text.guide }));
  await page.getByRole("button", { name: new RegExp(`${language === "es-MX" ? "Abrir Casa Club" : "Open Clubhouse"}$`) }).click();
  await expect(page.getByRole("dialog", { name: text.clubhouse, exact: true })).toBeVisible();
  const persistedGarment = page.locator(".wardrobe-garment-grid > button").filter({ hasText: selectedGarmentName });
  await expect(persistedGarment).toHaveAttribute("aria-pressed", "true");

  expect([...new Set(externalRequests)]).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

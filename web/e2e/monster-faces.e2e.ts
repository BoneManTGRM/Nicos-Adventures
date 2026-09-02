import { expect, test, type Locator, type Page } from "@playwright/test";

type Language = "en" | "es-MX";

const copy = {
  en: {
    world: "World Map",
    monsterLab: "Monster Lab",
    monsterHabitats: "Monster Habitats",
    languageButton: "Cambiar a español de México",
  },
  "es-MX": {
    world: "Mapa del mundo",
    monsterLab: "Laboratorio de monstruos",
    monsterHabitats: "Hábitats de monstruos",
    languageButton: "Cambiar a español de México",
  },
} as const;

const monsterFaces = [
  ["Blob", "blob-mischief"],
  ["Dragon", "sculpted-dragon"],
  ["Jungle Beast", "feral-guardian"],
  ["Stone Golem", "carved-golem"],
  ["Spirit", "mystic-spirit"],
  ["Cosmic", "cosmic-mask"],
  ["Aquatic", "aqua-creature"],
  ["Candy", "candy-smile"],
  ["Mecha", "mecha-visor"],
  ["Royal", "royal-crest"],
  ["Volcano", "molten-beast"],
  ["Ice Beast", "frost-beast"],
  ["Alien", "integrated-visor"],
  ["Lizard Alien", "integrated-lizard"],
  ["Dinosaur", "dino-predator"],
  ["Cloud", "cloud-dreamer"],
] as const;

async function activateWithKeyboard(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.scrollIntoViewIfNeeded();
  await locator.press("Enter");
}

async function openDestination(page: Page, name: string) {
  const destination = page.locator(".fw-destination").filter({ hasText: name });
  await expect(destination).toHaveCount(1);
  await activateWithKeyboard(destination);
}

async function waitForServiceWorkerControl(page: Page) {
  await expect.poll(
    () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)).catch(() => false),
    { timeout: 20_000 },
  ).toBe(true);
  await page.waitForLoadState("networkidle");
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

test("every original monster uses its finished body-specific artwork", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/");
  await waitForServiceWorkerControl(page);
  if (language === "es-MX") {
    await activateWithKeyboard(page.getByRole("button", { name: text.languageButton }));
  }
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();
  await openDestination(page, text.monsterLab);
  await expect(page.locator(".monster-lab-preview")).toBeVisible();
  await activateWithKeyboard(page.locator('.monster-studio__trait[data-trait="body"]'));

  for (const [body, treatment] of monsterFaces) {
    const choice = page.locator(`.monster-studio__choice[data-option="${body}"]`);
    await activateWithKeyboard(choice);
    await expect(choice).toHaveAttribute("aria-pressed", "true");

    const stage = page.locator(`.monster-v2[data-monster-body-art="${body}"]`);
    await expect(stage).toBeVisible();
    await expect(stage).toHaveAttribute("data-monster-face-treatment", treatment);
    await expect(stage.locator(".monster-premium-body__art")).toBeVisible();

    await expect(stage.locator(".monster-face, .monster-mouth, .monster-core")).toHaveCount(0);
    await expect(stage.locator(".monster-premium-body__art")).toHaveCSS("background-size", "contain");
    const artwork = await stage.locator(".monster-premium-body__art").evaluate((element) => {
      const backgroundImage = getComputedStyle(element).backgroundImage;
      const bounds = element.getBoundingClientRect();
      return { backgroundImage, width: bounds.width, height: bounds.height };
    });
    expect(artwork.backgroundImage, `${body}: artwork source`).toMatch(/\.webp/);
    expect(artwork.width, `${body}: artwork width`).toBeGreaterThan(100);
    expect(artwork.height, `${body}: artwork height`).toBeGreaterThan(100);

    if (["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name)) {
      await testInfo.attach(`monster-face-${slug(body)}`, {
        body: await page.locator(".monster-stage").screenshot({ animations: "disabled" }),
        contentType: "image/png",
      });
    }
  }

  const savedName = language === "es-MX" ? "Guardián Real" : "Royal Guardian";
  await activateWithKeyboard(page.locator('.monster-studio__choice[data-option="Royal"]'));
  await page.locator(".monster-lab-name input").fill(savedName);
  await page.locator(".fw-panel > .fw-action-row .fw-primary").click();
  await expect(page.locator(".monster-collection button").filter({ hasText: savedName })).toHaveCount(1);
  await expect(page.locator('.monster-v2[data-monster-body-art="Royal"]')).toHaveAttribute("data-monster-face-treatment", "royal-crest");

  await activateWithKeyboard(page.locator(".fw-brand"));
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();
  await openDestination(page, text.monsterHabitats);
  const habitat = page.locator(".monster-habitat-card").filter({ hasText: savedName });
  await expect(habitat).toHaveCount(1);
  await expect(habitat.locator('.monster-v2[data-monster-body-art="Royal"]')).toHaveAttribute("data-monster-face-treatment", "royal-crest");

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.alt || image.currentSrc),
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.clientWidth + 2);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.clientWidth + 2);
  expect(layout.brokenImages).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

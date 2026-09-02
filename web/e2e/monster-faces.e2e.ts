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

test("every original monster has a permanent integrated premium face", async ({ page }, testInfo) => {
  test.setTimeout(260_000);
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
  await expect(page.locator(".monster-studio__body-choice")).toHaveCount(monsterFaces.length);

  const previewColors = await page.locator(".monster-studio__body-choice").evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-monster-preview-color")),
  );
  expect(previewColors.every(Boolean)).toBe(true);
  expect(new Set(previewColors).size).toBeGreaterThanOrEqual(15);

  if (["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name)) {
    await testInfo.attach("monster-lab-integrated-gallery", {
      body: await page.screenshot({ fullPage: true, animations: "disabled" }),
      contentType: "image/png",
    });
  }

  await activateWithKeyboard(page.locator('.monster-studio__trait[data-trait="body"]'));

  for (const [body, treatment] of monsterFaces) {
    const choice = page.locator(`.monster-studio__choice[data-option="${body}"]`);
    await activateWithKeyboard(choice);
    await expect(choice).toHaveAttribute("aria-pressed", "true");

    const stage = page.locator(`.monster-v2[data-monster-body-art="${body}"]`);
    await expect(stage).toBeVisible();
    await expect(stage).toHaveAttribute("data-monster-face-treatment", treatment);
    await expect(stage.locator(".monster-premium-body__art")).toBeVisible();

    if (body === "Lizard Alien") {
      await expect(stage.locator(".monster-face, .monster-mouth, .monster-core")).toHaveCount(0);
      await expect(stage.locator(".monster-premium-body__art")).toBeVisible();
    } else {
      const face = stage.locator(".monster-face");
      const mouth = stage.locator(".monster-mouth");
      const core = stage.locator(".monster-core");
      await expect(face).toHaveCount(1);
      await expect(mouth).toHaveCount(1);
      await expect(core).toHaveCount(1);
      await expect(face).toHaveClass(/monster-face--integrated/);
      await expect(face).toHaveAttribute("data-monster-face-signature", treatment);
      await expect(face).toHaveAttribute("data-monster-face-integration", "sculpted-shell");
      await expect(face.locator(".monster-face-shell")).toHaveCount(1);
      await expect(mouth).toHaveClass(/monster-mouth--integrated/);
      await expect(mouth).toHaveAttribute("data-monster-mouth-signature", treatment);
      await expect(mouth.locator(".monster-snout")).toHaveCount(1);
      await expect(core).toHaveClass(/monster-core--subtle/);
      await expect(core).toHaveAttribute("data-monster-core-signature", treatment);

      const fit = await stage.evaluate((element) => {
        const stageBox = element.getBoundingClientRect();
        const faceBox = element.querySelector<SVGGElement>(".monster-face")!.getBoundingClientRect();
        const mouthBox = element.querySelector<SVGGElement>(".monster-mouth")!.getBoundingClientRect();
        const coreBox = element.querySelector<SVGGElement>(".monster-core")!.getBoundingClientRect();
        return {
          stageWidth: stageBox.width,
          stageHeight: stageBox.height,
          faceWidth: faceBox.width,
          faceHeight: faceBox.height,
          mouthWidth: mouthBox.width,
          mouthHeight: mouthBox.height,
          faceLeft: faceBox.left - stageBox.left,
          faceRight: faceBox.right - stageBox.left,
          faceTop: faceBox.top - stageBox.top,
          faceBottom: faceBox.bottom - stageBox.top,
          mouthTop: mouthBox.top - stageBox.top,
          mouthBottom: mouthBox.bottom - stageBox.top,
          coreTop: coreBox.top - stageBox.top,
          coreBottom: coreBox.bottom - stageBox.top,
        };
      });

      expect(fit.faceWidth, `${body}: integrated face width`).toBeGreaterThan(fit.stageWidth * 0.09);
      expect(fit.faceWidth, `${body}: integrated face width`).toBeLessThan(fit.stageWidth * 0.66);
      expect(fit.faceHeight, `${body}: integrated face height`).toBeGreaterThan(fit.stageHeight * 0.045);
      expect(fit.mouthWidth, `${body}: integrated snout width`).toBeGreaterThan(fit.stageWidth * 0.065);
      expect(fit.mouthHeight, `${body}: integrated snout height`).toBeGreaterThan(4);
      expect(fit.faceLeft, `${body}: face left`).toBeGreaterThanOrEqual(-5);
      expect(fit.faceRight, `${body}: face right`).toBeLessThanOrEqual(fit.stageWidth + 5);
      expect(fit.faceTop, `${body}: face top`).toBeGreaterThanOrEqual(-5);
      expect(fit.faceBottom, `${body}: face bottom`).toBeLessThan(fit.stageHeight * 0.66);
      expect(fit.mouthTop, `${body}: mouth top`).toBeGreaterThan(fit.faceTop);
      expect(fit.mouthBottom, `${body}: mouth bottom`).toBeLessThan(fit.stageHeight * 0.78);
      expect(fit.coreTop, `${body}: core top`).toBeGreaterThan(fit.mouthTop);
      expect(fit.coreBottom, `${body}: core bottom`).toBeLessThan(fit.stageHeight * 0.9);
    }

    if (["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name)) {
      await testInfo.attach(`monster-integrated-face-${slug(body)}`, {
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
  const savedRoyal = page.locator('.monster-v2[data-monster-body-art="Royal"]');
  await expect(savedRoyal).toHaveAttribute("data-monster-face-treatment", "royal-crest");
  await expect(savedRoyal.locator(".monster-face")).toHaveAttribute("data-monster-face-integration", "sculpted-shell");

  await activateWithKeyboard(page.locator(".fw-brand"));
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();
  await openDestination(page, text.monsterHabitats);
  const habitat = page.locator(".monster-habitat-card").filter({ hasText: savedName });
  await expect(habitat).toHaveCount(1);
  const habitatRoyal = habitat.locator('.monster-v2[data-monster-body-art="Royal"]');
  await expect(habitatRoyal).toHaveAttribute("data-monster-face-treatment", "royal-crest");
  await expect(habitatRoyal.locator(".monster-face")).toHaveAttribute("data-monster-face-integration", "sculpted-shell");

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

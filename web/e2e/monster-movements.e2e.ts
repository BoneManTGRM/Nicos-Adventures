import { expect, test, type Locator, type Page } from "@playwright/test";

type Language = "en" | "es-MX";

const copy = {
  en: {
    world: "World Map",
    monsterLab: "Monster Lab",
    languageButton: "Cambiar a español de México",
    motionGroup: "Monster movement images",
    myMonsters: "My Monsters",
  },
  "es-MX": {
    world: "Mapa del mundo",
    monsterLab: "Laboratorio de monstruos",
    languageButton: "Cambiar a español de México",
    motionGroup: "Imágenes de movimiento del monstruo",
    myMonsters: "Mis monstruos",
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

const movements = ["bounce", "spin", "roar", "fly", "dance", "sleep"] as const;

async function activate(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.scrollIntoViewIfNeeded();
  await locator.press("Enter");
}

async function openDestination(page: Page, name: string) {
  const destination = page.locator(".fw-destination").filter({ hasText: name });
  await expect(destination).toHaveCount(1);
  await activate(destination);
}

async function waitForServiceWorkerControl(page: Page) {
  await expect.poll(
    () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)).catch(() => false),
    { timeout: 20_000 },
  ).toBe(true);
  await page.waitForLoadState("networkidle");
}

async function selectBody(page: Page, body: string) {
  const choice = page.locator(`.monster-studio__body-choice[data-option="${body}"]`);
  await activate(choice);
  await expect(choice).toHaveAttribute("aria-pressed", "true");
}

async function playMovement(page: Page, movement: typeof movements[number]) {
  const button = page.locator(`[data-monster-motion="${movement}"]`);
  const creature = page.locator(".monster-v2");
  await activate(button);
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".monster-lab-preview")).toHaveAttribute("data-monster-motion-pose", movement);
  await expect(page.locator(".monster-stage")).toHaveClass(new RegExp(`monster-stage--${movement}`));

  const reducedMotion = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reducedMotion) {
    await expect.poll(async () => creature.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    const transform = await creature.evaluate((element) => getComputedStyle(element).transform);
    expect(transform).not.toBe("none");
  } else {
    await expect.poll(async () => creature.evaluate((element) => getComputedStyle(element).animationName))
      .toMatch(/^ml(Bounce|Spin|Roar|Fly|Levitate|Glide|Dance|Sleep)$/);
  }
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

test("Monster Lab matches the approved compact workspace and keeps every body safe", async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const language = testInfo.project.metadata.language as Language;
  const text = copy[language];
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/");
  await waitForServiceWorkerControl(page);
  if (language === "es-MX") await activate(page.getByRole("button", { name: text.languageButton }));
  await expect(page.getByRole("heading", { name: text.world, exact: true })).toBeVisible();
  await openDestination(page, text.monsterLab);

  await expect(page.locator(".monster-lab-commandbar")).toBeVisible();
  await expect(page.getByRole("heading", { name: text.monsterLab, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(text.myMonsters) })).toBeVisible();
  await expect(page.locator(".monster-studio__body-choice")).toHaveCount(16);
  await expect(page.locator(".monster-summary-card")).toBeVisible();
  await expect(page.getByRole("group", { name: text.motionGroup })).toBeVisible();
  await expect(page.locator("[data-monster-motion]")).toHaveCount(6);

  const workspace = await page.evaluate(() => {
    const controls = document.querySelector(".monster-lab-controls")?.getBoundingClientRect();
    const preview = document.querySelector(".monster-lab-preview")?.getBoundingClientRect();
    return {
      viewportWidth: document.documentElement.clientWidth,
      controls: controls ? { left: controls.left, top: controls.top, right: controls.right, bottom: controls.bottom } : null,
      preview: preview ? { left: preview.left, top: preview.top, right: preview.right, bottom: preview.bottom } : null,
    };
  });
  expect(workspace.controls).not.toBeNull();
  expect(workspace.preview).not.toBeNull();
  if (workspace.viewportWidth > 980) {
    expect(workspace.controls!.right).toBeLessThanOrEqual(workspace.preview!.left + 2);
  } else {
    expect(workspace.controls!.top).toBeLessThan(workspace.preview!.top);
  }

  for (const [index, [body, treatment]] of monsterFaces.entries()) {
    await selectBody(page, body);
    const movement = movements[index % movements.length];
    await playMovement(page, movement);

    const stage = page.locator(`.monster-v2[data-monster-body-art="${body}"]`);
    await expect(stage).toBeVisible();
    await expect(stage).toHaveAttribute("data-monster-face-treatment", treatment);
    await expect(page.locator(".monster-lab-preview")).toHaveAttribute("data-monster-motion-mass", /^(light|medium|heavy)$/);
    await expect(page.locator(".monster-lab-preview")).toHaveAttribute("data-monster-motion-locomotion", /^(ground|winged|floating|swimming|slime|mechanical)$/);

    if (body === "Lizard Alien") {
      await expect(stage.locator(".monster-face, .monster-mouth, .monster-core")).toHaveCount(0);
    } else {
      await expect(stage.locator(".monster-face")).toHaveAttribute("data-monster-face-signature", treatment);
    }
  }

  const representativeBodies = ["Blob", "Dragon", "Spirit", "Mecha", "Lizard Alien", "Cloud"] as const;
  for (const [index, movement] of movements.entries()) {
    const body = representativeBodies[index];
    await selectBody(page, body);
    await playMovement(page, movement);
    await page.waitForTimeout(250);

    await expect(page.locator(`.monster-v2[data-monster-body-art="${body}"]`)).toBeVisible();
    if (["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name)) {
      await testInfo.attach(`monster-workspace-${slug(body)}-${movement}`, {
        body: await page.locator(".monster-lab-experience").screenshot({ animations: "allow" }),
        contentType: "image/png",
      });
    }
  }

  await page.locator(".monster-action-row").evaluate((element) => element.scrollIntoView({ block: "center" }));
  const navigationOverlap = await page.evaluate(() => {
    const actions = document.querySelector(".monster-action-row")?.getBoundingClientRect();
    const navigation = document.querySelector(".fw-bottom-nav")?.getBoundingClientRect();
    if (!actions || !navigation) return false;
    return actions.bottom > navigation.top && actions.top < navigation.bottom;
  });
  expect(navigationOverlap).toBe(false);

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

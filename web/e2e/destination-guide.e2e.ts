import { expect, test, type Page } from "@playwright/test";
import type { LocalProfile } from "../src/types";
import { applyStarBridgeEvent } from "../src/game/goldenAdventureProfile";

async function setUp(page: Page, es: boolean, prepare?: (profile: LocalProfile) => LocalProfile) {
  await page.goto("/");
  await expect(page.locator(".fw-brand")).toBeVisible();
  const current: LocalProfile = await page.evaluate(() => JSON.parse(localStorage.getItem("nicos-world-local-save-v4")!).profiles[0]);
  current.language = es ? "es-MX" : "en";
  const profile = prepare ? prepare(current) : current;
  await page.evaluate(value => localStorage.setItem("nicos-world-local-save-v4", JSON.stringify({
    schemaVersion: 4, activeProfileId: value.id, profiles: [value],
  })), profile);
  await page.reload();
}

test("destination filters, illustrated cards and passport survive a return visit", async ({ page }, info) => {
  const es = info.project.metadata.language === "es-MX";
  await setUp(page, es);
  await page.getByRole("link", { name: es ? "Guía de destinos" : "Destination guide" }).click();
  const filters = page.locator(".atlas-filters");
  const guide = page.locator("#atlas-places");
  await expect.poll(() => guide.locator(".atlas-place__picture > img").evaluateAll(images => images.slice(0, 4).every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await info.attach("illustrated-destinations", { body: await page.screenshot(), contentType: "image/png" });
  await filters.getByRole("button", { name: es ? "Crear" : "Create", exact: true }).click();
  await expect(guide.getByRole("button")).toHaveCount(6);
  await expect(guide.locator(".nico-world-destination")).toBeHidden();
  await filters.getByRole("button", { name: es ? "Mi mundo" : "My world" }).click();
  await expect(guide.getByRole("button")).toHaveCount(5);
  await guide.locator(".nico-world-destination").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: es ? /Cerrar/ : /Close/ }).first().click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".atlas-passport b")).toHaveText(/^1\//);
  await guide.getByRole("button", { name: es ? /^Observatorio de insignias/ : /^Badge Observatory/ }).click();
  await page.getByRole("button", { name: es ? /Ir por la insignia: Creador de monstruos/ : /Work on badge: Monster Maker/ }).click();
  await expect(page.locator("#page-title")).toHaveText(es ? "Laboratorio de monstruos" : "Monster Lab");
  await page.reload();
  await page.goto("/#destinations");
  const studio = guide.getByRole("button", { name: es ? /^Laboratorio de monstruos/ : /^Monster Lab/ });
  await expect(studio).toContainText(es ? "Visitado" : "Visited");
  await expect(guide.locator(".nico-world-destination")).toContainText(es ? "Visitado" : "Visited");
  await expect(guide.locator(".is-locked")).toBeDisabled();
  await expect(page.locator(".atlas-passport b")).toHaveText(/^3\//);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await studio.scrollIntoViewIfNeeded();
  await expect.poll(() => studio.locator("img").evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("the bridge can be diagnosed on the painting, repaired and crossed into the valley", async ({ page }, info) => {
  const es = info.project.metadata.language === "es-MX";
  await setUp(page, es, profile => {
    for (const type of ["REVEAL_BRIDGE", "CONFIGURE_ROBOT", "PASS_MOVEMENT_TEST", "PASS_SCANNER_TEST", "PASS_LOGIC_TEST"] as const) {
      profile = applyStarBridgeEvent(profile, { type });
    }
    return profile;
  });
  await page.locator(".fw-star-bridge__action").click();
  await page.locator('[data-target="cracked-handrail"]').click();
  await expect(page.locator(".bridge-feedback.is-wrong")).toBeVisible();
  await page.locator('[data-target="dark-core-socket"]').click();
  await page.getByRole("button", { name: es ? "Confirmar falla del puente" : "Confirm bridge fault" }).click();
  for (const name of es ? ["Alinear", "Fijar", "Cargar"] : ["Align", "Lock", "Charge"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  await page.getByRole("button", { name: es ? "Instalar Núcleo Estelar" : "Install Star Core", exact: true }).click();
  await page.locator(".bridge-activate").click();
  await expect(page.locator(".illustrated-bridge__landscape")).toHaveAttribute("src", /star-bridge-restored/);
  await page.getByRole("button", { name: es ? "Entrar al Valle de Dinosaurios" : "Enter Dinosaur Valley" }).click();
  await expect(page.locator("#main-content")).toHaveAttribute("data-section-id", "dinosaur-valley");
});

test("the guide opens each available destination and keeps every painting on the phone screen", async ({ page }, info) => {
  const es = info.project.metadata.language === "es-MX";
  await setUp(page, es);
  const guide = page.locator("#atlas-places");
  await expect(guide.getByRole("button").first()).toBeVisible();
  const names = await guide.locator(".atlas-place:not(.is-locked):not(.nico-world-destination) > strong").allTextContents();
  expect(names.length).toBeGreaterThanOrEqual(14);
  for (const name of names) {
    const card = guide.getByRole("button").filter({ has: page.getByText(name, { exact: true }) });
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.locator("img").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await card.click();
    await expect(page.locator("#page-title")).toHaveText(name);
    await expect(page.getByRole("alert").filter({ hasText: /reload|recargar/i })).toHaveCount(0);
    await page.locator(".fw-brand").click();
    await expect(guide).toBeVisible();
  }
});

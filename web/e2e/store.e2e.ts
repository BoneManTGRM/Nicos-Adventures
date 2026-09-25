import { expect, test, type Page } from "@playwright/test";
import { syntheticCatalog } from "../test-fixtures/store";
import { storeCopy } from "../src/store/copy";
import type { StoreLanguage } from "../src/store/types";

async function fixture(page: Page, catalog = syntheticCatalog()) {
  await page.route("**/store-catalog.json", route => route.fulfill({ json: catalog, headers: { "cache-control": "no-store" } }));
  await page.route("**/store-images/*.webp", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#152b48"/><text x="320" y="220" fill="white" font-size="24" text-anchor="middle">SYNTHETIC TEST IMAGE</text><text x="320" y="270" fill="white" font-size="20" text-anchor="middle">NOT A REAL PRODUCT</text></svg>' }));
}
async function prepare(page: Page, language: StoreLanguage) {
  const copy = storeCopy(language);
  await page.getByText(copy.details, { exact: true }).click();
  await page.getByLabel(copy.option, { exact: true }).selectOption("blue");
  await page.getByLabel(copy.quantity, { exact: true }).fill("2");
  await page.getByLabel(copy.adult, { exact: true }).check();
  await page.getByRole("button", { name: copy.prepare, exact: true }).click();
  await expect(page.getByRole("link", { name: copy.email, exact: true })).toBeVisible();
}
test("store has its own bilingual route and does not read or create a child profile", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  await page.addInitScript(() => {
    Object.defineProperty(window, "__storeReads", { value: [] });
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) { (window as unknown as { __storeReads: string[] }).__storeReads.push(key); return original.call(this, key); };
  });
  await page.goto(`/store?lang=${language}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.title);
  await expect(page.getByRole("link", { name: copy.back })).toBeVisible();
  await expect(page.getByTestId("store-status")).toContainText(copy.closed);
  await expect(page.getByRole("heading", { name: copy.emptyTitle })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __storeReads: string[] }).__storeReads)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("store-empty.png"), fullPage: true });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.title);
});
test("language toggle, direct trailing slash, keyboard focus and exact route boundary", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, other = language === "en" ? "es-MX" : "en";
  await page.goto(`/store/?lang=${language}`);
  await page.getByRole("button", { name: language === "en" ? "Cambiar a español" : "Switch to English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(storeCopy(other).title);
  await expect(page).toHaveURL(new RegExp(`/store\\?lang=${other}$`));
  await page.reload(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(storeCopy(other).title);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).not.toBe("none");
  await page.goto("/storehouse"); await expect(page.locator(".fw-app")).toBeVisible();
});
test("real empty catalog has no synthetic listings, external orders or leaked data", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", request => { if (!request.url().startsWith("http://127.0.0.1:4173")) outbound.push(request.url()); });
  await page.goto("/store"); await expect(page.getByTestId("store-status")).toBeVisible();
  const response = await page.request.get("/store-catalog.json");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ version: 1, salesEnabled: false, seller: null, products: [] });
  expect(await page.locator('a[href^="mailto:"], a[href*="wa.me"], iframe, input[type="email"]').count()).toBe(0);
  await expect(page.locator("body")).not.toContainText("SYNTHETIC"); expect(outbound).toEqual([]);
});
test("approved synthetic journey prepares correct request without sending or confirming", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  await fixture(page); await page.goto(`/store?lang=${language}`); await prepare(page, language);
  const link = page.getByRole("link", { name: copy.email, exact: true });
  const url = new URL((await link.getAttribute("href"))!);
  expect(url.protocol).toBe("mailto:"); expect(url.pathname).toBe("orders@example.invalid");
  expect(url.searchParams.get("body")).toContain(language === "en" ? "Quantity: 2" : "Cantidad: 2");
  expect(url.searchParams.get("body")).toContain("MXN"); expect(url.searchParams.get("body")).toContain("299");
  await expect(page.getByText(copy.fallback)).toBeVisible();
  await expect(page.getByLabel(copy.requestText, { exact: true })).toContainText(language === "en" ? "not a confirmed order or payment" : "no es un pedido ni un pago confirmado");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("store-synthetic-request.png"), fullPage: true });
  await page.getByLabel(copy.quantity, { exact: true }).fill("3"); await expect(link).toHaveCount(0);
});
test("invalid quantity, unavailable variant, missing adult and disabled sales fail closed", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  await fixture(page); await page.goto(`/store?lang=${language}`); await page.getByText(copy.details, { exact: true }).click();
  const button = page.getByRole("button", { name: copy.prepare, exact: true });
  await expect(button).toBeDisabled();
  await expect(page.getByRole("option", { name: new RegExp(language === "en" ? "Test red" : "Rojo de prueba") })).toBeDisabled();
  await page.getByLabel(copy.option, { exact: true }).selectOption("blue"); await page.getByLabel(copy.adult, { exact: true }).check();
  for (const value of ["0", "1.5", "11", ""]) { await page.getByLabel(copy.quantity, { exact: true }).fill(value); await expect(button).toBeDisabled(); }
  const raw = syntheticCatalog(); raw.salesEnabled = false;
  await page.unroute("**/store-catalog.json"); await fixture(page, raw); await page.reload();
  await page.getByText(copy.details, { exact: true }).click(); await expect(button).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});
test("fresh catalog is rechecked and a removed listing cannot be ordered", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  await fixture(page); await page.goto(`/store?lang=${language}`); await page.getByText(copy.details, { exact: true }).click();
  await page.getByLabel(copy.option, { exact: true }).selectOption("blue"); await page.getByLabel(copy.adult, { exact: true }).check();
  await page.unroute("**/store-catalog.json"); await page.route("**/store-catalog.json", route => route.fulfill({ json: { version: 1, salesEnabled: false, seller: null, products: [] } }));
  await page.getByRole("button", { name: copy.prepare, exact: true }).click();
  await expect(page.getByRole("heading", { name: copy.emptyTitle })).toBeVisible();
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});
test("offline removes prepared links and reconnect never sends a request", async ({ page, context }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  await fixture(page); await page.goto(`/store?lang=${language}`); await prepare(page, language);
  await context.setOffline(true);
  await expect(page.getByRole("link", { name: copy.email, exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: copy.prepare, exact: true })).toBeDisabled();
  await expect(page.getByTestId("store-status")).toContainText(copy.offline);
  await context.setOffline(false);
  await expect(page.getByTestId("store-status")).toContainText(copy.open);
  await expect(page.getByRole("link", { name: copy.email, exact: true })).toHaveCount(0);
});
test("network failure and broken photos show honest unavailable states", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  await page.route("**/store-catalog.json", route => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto(`/store?lang=${language}`); await expect(page.getByTestId("store-status")).toContainText(copy.unavailable);
  await expect(page.getByRole("button", { name: copy.retry })).toBeVisible();
  await page.unroute("**/store-catalog.json"); await fixture(page);
  await page.unroute("**/store-images/*.webp"); await page.route("**/store-images/*.webp", route => route.fulfill({ status: 404, body: "Missing" }));
  await page.getByRole("button", { name: copy.retry }).click();
  await expect(page.getByText(copy.imageMissing, { exact: true })).toBeVisible();
  await page.getByText(copy.details, { exact: true }).click();
  await expect(page.getByRole("button", { name: copy.prepare, exact: true })).toHaveCount(0);
});
test("drafts, sold-out products, missing information and long names stay truthful", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
  const raw = syntheticCatalog(); const draft = structuredClone(raw.products[0]); draft.id = "private-draft"; draft.publication = "draft"; draft.name.en = "PRIVATE_DRAFT_SENTINEL"; raw.products.push(draft);
  raw.products[0].name[language] = "TEST ".repeat(70); raw.products[0].availability = "sold-out"; Object.assign(raw.products[0], { material: null, price: null });
  await fixture(page, raw); await page.goto(`/store?lang=${language}`);
  await expect(page.locator(".toy-card")).toHaveCount(1); await expect(page.locator("body")).not.toContainText("PRIVATE_DRAFT_SENTINEL");
  await expect(page.getByText(copy.soldOut, { exact: true })).toBeVisible(); await expect(page.getByText(copy.pricePending, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("store-long-name.png"), fullPage: true });
});
test("world navigation retains local saves and browser back returns to the game", async ({ page }, testInfo) => {
  await page.goto("/"); await expect(page.locator(".fw-app")).toBeVisible();
  const store = page.locator(".fw-store-link"); await expect(store).toBeVisible();
  const before = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
  expect(Object.keys(before).some(key => key.includes("nico"))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("world-with-store-link.png"), fullPage: true });
  await store.click(); await expect(page.locator(".toy-store")).toBeVisible();
  expect(await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])))).toEqual(before);
  await page.goBack(); await expect(page.locator(".fw-app")).toBeVisible();
});
test.describe("actual service worker", () => {
  test.use({ serviceWorkers: "allow" });
  test("offline shell and games remain available without caching catalog or customer data", async ({ page, context }, testInfo) => {
    const language = String(testInfo.project.metadata.language) as StoreLanguage, copy = storeCopy(language);
    await page.goto(`/store?lang=${language}`); await expect(page.getByRole("heading", { name: copy.emptyTitle })).toBeVisible();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })); });
    await page.evaluate(() => fetch("/store-catalog.json", { cache: "no-store" }));
    const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async name => (await (await caches.open(name)).keys()).map(request => request.url)))).flat());
    expect(cached.some(url => url.includes("store-catalog") || url.includes("orders@example"))).toBe(false);
    await context.setOffline(true); await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.title);
    await expect(page.getByTestId("store-status")).toContainText(copy.offline);
    expect(await page.evaluate(() => fetch("/store-catalog.json").then(() => true, () => false))).toBe(false);
    await page.getByRole("link", { name: copy.back }).click(); await expect(page.locator(".fw-app")).toBeVisible();
    await context.setOffline(false);
  });
});

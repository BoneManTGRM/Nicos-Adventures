const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium, webkit } = require("playwright");

const baseURL = process.env.NICO_BASE_URL || "http://127.0.0.1:4173";
const outputRoot = path.resolve(process.env.NICO_BROWSER_OUTPUT || "test-results/browser-gate");
fs.mkdirSync(outputRoot, { recursive: true });

const profiles = [
  { name: "chromium-desktop", engine: chromium, viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: "webkit-iphone", engine: webkit, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: "webkit-ipad", engine: webkit, viewport: { width: 834, height: 1112 }, isMobile: true, hasTouch: true },
  { name: "chromium-projector", engine: chromium, viewport: { width: 1920, height: 1080 }, isMobile: false, hasTouch: false },
];

async function installLocalNetworkPolicy(context) {
  await context.route(/https:\/\/(en\.wikipedia\.org|upload\.wikimedia\.org)\//, async (route) => {
    await route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });
}

async function waitForApp(page) {
  await page.waitForSelector(".fw-app", { state: "visible", timeout: 20_000 });
  await page.waitForFunction(() => document.readyState === "complete");
}

async function assertLayout(page, label) {
  const metrics = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.alt || image.src.slice(0, 80)),
    duplicateGuides: document.querySelectorAll(".nico-guide__launcher").length,
  }));
  assert.ok(metrics.scrollWidth <= metrics.width + 2, `${label}: horizontal document overflow ${metrics.scrollWidth} > ${metrics.width}`);
  assert.ok(metrics.bodyWidth <= metrics.width + 2, `${label}: horizontal body overflow ${metrics.bodyWidth} > ${metrics.width}`);
  assert.deepEqual(metrics.brokenImages, [], `${label}: broken images: ${metrics.brokenImages.join(", ")}`);
  assert.equal(metrics.duplicateGuides, 1, `${label}: expected one Nico guide launcher`);
}

async function screenshot(page, profileName, name) {
  const directory = path.join(outputRoot, profileName);
  fs.mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, `${name}.png`), fullPage: true, animations: "disabled" });
}

async function dispatchTouchDrag(page, sourceText) {
  const source = page.locator(".wardrobe-garment-grid button", { hasText: sourceText }).first();
  const stage = page.locator("[data-nico-wardrobe-stage]");
  await source.scrollIntoViewIfNeeded();
  const sourceBox = await source.boundingBox();
  const stageBox = await stage.boundingBox();
  assert.ok(sourceBox && stageBox, "Wardrobe source or stage has no layout box");
  const start = { x: sourceBox.x + sourceBox.width / 2, y: sourceBox.y + sourceBox.height / 2 };
  const end = { x: stageBox.x + stageBox.width / 2, y: stageBox.y + stageBox.height / 2 };

  const fire = async (type, point, buttons) => {
    await page.evaluate(({ sourceText, type, point, buttons }) => {
      const source = [...document.querySelectorAll(".wardrobe-garment-grid button")]
        .find((element) => element.textContent?.includes(sourceText));
      if (!source) throw new Error(`Garment source not found: ${sourceText}`);
      source.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 41,
        pointerType: "touch",
        isPrimary: true,
        button: type === "pointerdown" ? 0 : -1,
        buttons,
        clientX: point.x,
        clientY: point.y,
        pressure: buttons ? .7 : 0,
      }));
    }, { sourceText, type, point, buttons });
  };

  await fire("pointerdown", start, 1);
  await page.waitForTimeout(40);
  for (let step = 1; step <= 5; step += 1) {
    const point = {
      x: start.x + (end.x - start.x) * (step / 5),
      y: start.y + (end.y - start.y) * (step / 5),
    };
    await fire("pointermove", point, 1);
    await page.waitForTimeout(30);
  }
  await fire("pointerup", end, 0);
}

async function testWardrobePersistence(browser, profile) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    deviceScaleFactor: profile.isMobile ? 2 : 1,
    locale: "en-US",
    serviceWorkers: "allow",
  });
  await installLocalNetworkPolicy(context);
  const page = await context.newPage();
  await page.goto(`${baseURL}/#nico/dress`, { waitUntil: "networkidle" });
  await page.waitForSelector(".wardrobe-studio", { state: "visible" });
  await assertLayout(page, `${profile.name} wardrobe initial`);

  await page.getByRole("tab", { name: /Shirts/i }).click();
  const initialShoes = await page.locator(".wardrobe-equipped-list").textContent();
  assert.match(initialShoes || "", /shoes/i, "Equipped list should expose shoes before changing the shirt");
  await dispatchTouchDrag(page, "Soccer jersey");
  await page.waitForFunction(() => document.querySelector(".wardrobe-equipped-list")?.textContent?.includes("Soccer jersey"));
  const equipped = await page.locator(".wardrobe-equipped-list").textContent();
  assert.match(equipped || "", /Soccer jersey/, "Dragged shirt was not equipped");
  assert.match(equipped || "", /Green sneakers/, "Changing the shirt replaced unrelated shoes");
  await page.getByRole("button", { name: /Save Nico’s wardrobe/i }).click();

  const storedTop = await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("nicos-world-local-save-v4") || "null");
    return store?.profiles?.find((profile) => profile.id === store.activeProfileId)?.nico?.wardrobe?.top;
  });
  assert.equal(storedTop, "soccer-jersey", "Saved schema-v4 wardrobe did not contain the equipped shirt");

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".wardrobe-studio", { state: "visible" });
  await page.waitForFunction(() => document.querySelector(".wardrobe-equipped-list")?.textContent?.includes("Soccer jersey"));
  await assertLayout(page, `${profile.name} wardrobe restored`);
  await screenshot(page, profile.name, "wardrobe-restored");
  await context.close();
}

async function testClubhouseHistory(browser, profile) {
  const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch, serviceWorkers: "allow" });
  await installLocalNetworkPolicy(context);
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitForApp(page);
  await page.locator(".nico-guide__launcher").click();
  await page.getByRole("button", { name: /Open Clubhouse/i }).click();
  await page.waitForSelector(".nico-hub", { state: "visible" });
  assert.match(page.url(), /#nico\/dress$/, "Clubhouse did not push the wardrobe route");
  const focused = await page.evaluate(() => document.activeElement?.classList.contains("nico-hub__close"));
  assert.equal(focused, true, "Clubhouse did not move focus to its close control");
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".nico-hub", { state: "hidden" });
  await page.goForward({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".nico-hub", { state: "visible" });
  await context.close();
}

async function testOfflineReload(browser, profile) {
  const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch, serviceWorkers: "allow" });
  await installLocalNetworkPolicy(context);
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitForApp(page);
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable");
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
    }
  });
  await page.waitForTimeout(250);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForSelector(".fw-app", { state: "visible", timeout: 20_000 });
  assert.ok(await page.getByRole("heading", { name: /World Map/i }).isVisible(), "Offline reload did not restore the World Map");
  await context.setOffline(false);
  await context.close();
}

async function testUnsupportedRecording(browser, profile) {
  const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch, serviceWorkers: "block" });
  await installLocalNetworkPolicy(context);
  await context.addInitScript(() => {
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: undefined });
    Object.defineProperty(HTMLCanvasElement.prototype, "captureStream", { configurable: true, value: undefined });
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/#nico/showtime`, { waitUntil: "networkidle" });
  await page.waitForSelector(".showtime-studio", { state: "visible" });
  assert.ok(await page.getByText(/cannot create a downloadable video/i).isVisible(), "Unsupported recording fallback was not shown");
  await context.close();
}

async function captureDestinationViews(browser, profile) {
  const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch, serviceWorkers: "allow" });
  await installLocalNetworkPolicy(context);
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitForApp(page);
  await assertLayout(page, `${profile.name} world map`);
  await screenshot(page, profile.name, "world-map");

  for (const destination of ["Animal Forest", "Dinosaur Valley", "Robot Home"]) {
    await page.getByRole("button", { name: new RegExp(`^${destination}\\.`) }).click();
    await page.waitForSelector(`[data-section-id]`, { state: "visible" });
    await page.waitForTimeout(100);
    await assertLayout(page, `${profile.name} ${destination}`);
    await screenshot(page, profile.name, destination.toLowerCase().replaceAll(" ", "-"));
    await page.locator(".fw-brand").click();
    await page.getByRole("heading", { name: /World Map/i }).waitFor();
  }
  await context.close();
}

async function runProfile(profile) {
  const browser = await profile.engine.launch({ headless: true });
  const traceDir = path.join(outputRoot, profile.name);
  fs.mkdirSync(traceDir, { recursive: true });
  try {
    await testWardrobePersistence(browser, profile);
    await testClubhouseHistory(browser, profile);
    await captureDestinationViews(browser, profile);
    if (profile.name === "chromium-desktop") await testOfflineReload(browser, profile);
    if (profile.name === "webkit-iphone") await testUnsupportedRecording(browser, profile);
  } finally {
    await browser.close();
  }
}

(async () => {
  const failures = [];
  for (const profile of profiles) {
    try {
      process.stdout.write(`\n[Browser gate] ${profile.name}\n`);
      await runProfile(profile);
      process.stdout.write(`[Browser gate] ${profile.name}: PASS\n`);
    } catch (error) {
      failures.push({ profile: profile.name, error });
      console.error(`[Browser gate] ${profile.name}: FAIL`, error);
    }
  }
  if (failures.length) {
    throw new AggregateError(failures.map((failure) => failure.error), `${failures.length} browser profile(s) failed`);
  }
  process.stdout.write("\nBrowser quality gate passed for Chromium desktop/projector and WebKit iPhone/iPad.\n");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { chromium, webkit, devices } from "@playwright/test";

const origin = "https://nicos-world.com";
const expected = process.env.EXPECTED_SHA;
assert.match(expected || "", /^[a-f0-9]{40}$/, "An exact expected production commit is required");
const output = "store-production-proof";
await mkdir(output, { recursive: true });
const proof = { expectedCommit: expected, origin, startedAt: new Date().toISOString(), checks: [], passed: false };
const hash = bytes => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function get(path) {
  const response = await fetch(`${origin}${path}`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
  assert.equal(response.status, 200, `${path} must return 200`);
  return response;
}
try {
  const local = JSON.parse(await readFile("dist/release.json", "utf8"));
  assert.equal(local.commitSha, expected, "Verification checkout must match the expected deployment");
  const deadline = Date.now() + 8 * 60_000;
  let release;
  while (Date.now() < deadline) {
    try { release = await (await get("/release.json")).json(); if (release.commitSha === expected) break; }
    catch (error) { proof.lastReleaseError = String(error); }
    await pause(5000);
  }
  proof.release = release;
  assert.equal(release?.commitSha, expected, "Production did not serve the expected release within eight minutes");
  const worker = Buffer.from(await (await get("/sw.js")).arrayBuffer());
  assert.equal(hash(worker), local.serviceWorkerHash, "Live worker differs from the verified checkout");
  assert.equal(hash(worker), release.serviceWorkerHash, "Live release receipt does not match its worker");
  const catalogResponse = await get("/store-catalog.json");
  assert.match(catalogResponse.headers.get("cache-control") || "", /no-store/i);
  const catalog = await catalogResponse.json();
  assert.deepEqual(catalog, JSON.parse(await readFile("dist/store-catalog.json", "utf8")), "Live public catalog differs from the approved build");
  proof.catalog = { salesEnabled: catalog.salesEnabled, publishedProducts: catalog.products.length };
  proof.storeChunks = [];
  const chunks = (await readdir("dist/assets")).filter(name => /^StorePage-.+\.(js|css)$/.test(name));
  assert.equal(chunks.length, 2, "Expected the lazy store script and stylesheet");
  for (const name of chunks) {
    const bytes = Buffer.from(await (await get(`/assets/${name}`)).arrayBuffer());
    assert.equal(hash(bytes), hash(await readFile(`dist/assets/${name}`)), `Live ${name} differs from the verified build`);
    proof.storeChunks.push({ name, sha256: hash(bytes) });
  }
  const platforms = [
    { name: "desktop-chromium", engine: chromium, use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile-chromium", engine: chromium, use: devices["Pixel 7"] },
    { name: "iphone-webkit", engine: webkit, use: devices["iPhone 13"] },
  ];
  for (const platform of platforms) {
    const browser = await platform.engine.launch();
    try {
      for (const language of ["en", "es-MX"]) {
        const context = await browser.newContext({ ...platform.use, locale: language === "en" ? "en-US" : language, serviceWorkers: "allow", reducedMotion: "reduce" });
        const page = await context.newPage();
        const result = { platform: platform.name, browserVersion: browser.version(), language, passed: false };
        proof.checks.push(result);
        try {
          const external = [];
          const track = request => { if (new URL(request.url()).origin !== origin) external.push(request.url()); };
          page.on("request", track);
          await page.goto(`${origin}/store?lang=${language}`, { waitUntil: "networkidle", timeout: 30_000 });
          const title = language === "en" ? "Nico’s Toy Shop" : "La Tiendita de Nico";
          await page.getByRole("heading", { level: 1, name: title, exact: true }).waitFor();
          assert.equal(await page.locator(".toy-card").count(), catalog.products.length);
          if (!catalog.salesEnabled) {
            assert.equal(await page.locator('a[href^="mailto:"], a[href*="wa.me/"]').count(), 0);
            assert.match(await page.getByTestId("store-status").innerText(), language === "en" ? /not accepting orders/ : /No estamos aceptando pedidos/);
          }
          assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [], "Direct store visit must not create child profiles");
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
          assert.deepEqual(external, [], "Store must not initiate external provider requests");
          await page.screenshot({ path: `${output}/${platform.name}-${language}.png`, fullPage: true });
          await page.getByRole("button", { name: language === "en" ? "Cambiar a español" : "Switch to English", exact: true }).click();
          await page.reload();
          await page.getByRole("heading", { level: 1, name: language === "en" ? "La Tiendita de Nico" : "Nico’s Toy Shop", exact: true }).waitFor();
          assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
          page.off("request", track);
          await page.getByRole("link", { name: language === "en" ? "Volver al Mundo de Nico" : "Back to Nico’s World", exact: true }).click();
          await page.locator(".fw-app").waitFor();
          await page.locator(".fw-store-link").waitFor();
          result.passed = true;
        } catch (error) {
          result.error = String(error);
          await page.screenshot({ path: `${output}/${platform.name}-${language}-failure.png`, fullPage: true }).catch(() => undefined);
        } finally { await context.close(); }
      }
    } finally { await browser.close(); }
  }
  assert.equal((await (await get("/release.json")).json()).commitSha, expected, "Production changed during verification");
  assert.equal(proof.checks.length, 6);
  assert.equal(proof.checks.every(check => check.passed), true, "At least one production browser check failed");
  proof.passed = true;
} catch (error) {
  proof.error = String(error);
  process.exitCode = 1;
} finally {
  proof.finishedAt = new Date().toISOString();
  await writeFile(`${output}/results.json`, `${JSON.stringify(proof, null, 2)}\n`);
  console.log(JSON.stringify(proof, null, 2));
}

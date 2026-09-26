import { expect, test } from "@playwright/test";

test("Signal Run teaches commands, completes a route, and saves progress", async ({ page }, testInfo) => {
  test.skip(!["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name));
  const es = testInfo.project.metadata.language === "es-MX";
  await page.goto("/");
  if (es) await page.getByRole("button", { name: "Cambiar a español de México" }).click();
  const arcade = es ? "Sala de juegos" : "Game Arcade";
  await page.locator(".fw-destination-grid > .fw-destination").filter({ hasText: arcade }).click();
  await page.getByTestId("open-signal-run").click();
  const game = page.getByTestId("signal-run");
  await expect(game).toBeVisible();
  await expect(page.locator(".monster-arcade-entry")).toBeHidden();
  await expect(game.getByText(es ? /Coloca órdenes/ : /Queue commands/)).toBeVisible();
  for (let index = 0; index < 4; index++) await game.getByRole("button", { name: es ? "Avanzar" : "Forward" }).click();
  await game.getByRole("button", { name: es ? /^Ejecutar/ : /^Run/ }).click();
  await expect(game.getByRole("status")).toContainText(es ? "¡Ruta completa!" : "Route complete!");
  await expect(game.getByText("⭐ 1/12")).toBeVisible();
  await game.getByRole("button", { name: es ? /Siguiente ruta/ : /Next route/ }).click();
  await expect(game.getByText(es ? "Ruta 2/12" : "Route 2/12")).toBeVisible();
  await game.getByRole("button", { name: es ? "Todos los juegos" : "All games" }).click();
  await page.getByTestId("open-signal-run").click();
  await expect(page.getByTestId("signal-run").getByText(es ? "Ruta 2/12" : "Route 2/12")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true);
});

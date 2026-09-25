import { expect, test } from "@playwright/test";

test("store has its own bilingual route and does not create a child profile", async ({ page }, testInfo) => {
  const language = String(testInfo.project.metadata.language);
  await page.goto(`/store?lang=${language}`);
  await page.screenshot({ path: testInfo.outputPath("store-route.png"), fullPage: true });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(language === "es-MX" ? "La Tiendita de Nico" : "Nico’s Toy Shop");
  await expect(page.getByRole("link", { name: language === "es-MX" ? "Volver al Mundo de Nico" : "Back to Nico’s World" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(language === "es-MX" ? "No estamos aceptando pedidos" : "We are not accepting orders");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(language === "es-MX" ? "La Tiendita de Nico" : "Nico’s Toy Shop");
});

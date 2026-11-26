import { expect, test } from "@playwright/test";

test("Skullwing accepts touch and keyboard attacks and returns to city selection", async ({ page }, info) => {
  const spanish = info.project.metadata.language === "es-MX";
  const touch = info.project.use.hasTouch === true;
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/games/skullwing/?lang=" + (spanish ? "es-MX" : "en"));
  const start = page.getByRole("button", { name: spanish ? "Aplasta la ciudad" : "Smash the city" });
  await start.click();
  const roar = page.locator('[data-action="roar"]');
  if (touch) {
    await page.locator('[data-action="jump"]').tap();
    await page.locator('[data-action="jump"]').tap();
    await page.locator('[data-action="attack"]').tap();
    await expect(page.locator("#hint")).toContainText(spanish ? "Ruge" : "Roar");
    await roar.tap();
  } else {
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await page.keyboard.press("x");
    await expect(page.locator("#hint")).toContainText("C");
    await page.keyboard.press("c");
  }
  await expect(roar).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#clearCount")).not.toHaveText("0 / 12");
  await page.getByRole("button", { name: spanish ? "Pausa" : "Pause" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: spanish ? "Elegir ciudad" : "City select" }).click();
  await page.getByRole("button", { name: spanish ? "Bahía Polar" : "Frostline Bay" }).click();
  await start.click();
  await expect(page.locator("#districtName")).toHaveText(spanish ? "Bahía Polar" : "Frostline Bay");
  await expect(page.locator("#clearCount")).toHaveText("0 / 16");
  expect(errors).toEqual([]);
});

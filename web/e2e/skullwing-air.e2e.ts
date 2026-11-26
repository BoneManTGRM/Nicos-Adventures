import { expect, test } from "@playwright/test";

test("a midair roar knocks a patrolling plane down", async ({ page }, info) => {
  const spanish = info.project.metadata.language === "es-MX";
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/games/skullwing/?lang=" + (spanish ? "es-MX" : "en"));
  await page.locator("#start").click();
  await expect(page.locator("#world")).toBeVisible();
  const flap = page.locator('[data-action="jump"]');
  const roar = page.locator('[data-action="roar"]');
  if (info.project.use.hasTouch) {
    await flap.tap();
    await roar.tap();
  } else {
    await page.keyboard.press("Space");
    await page.keyboard.press("c");
  }
  await expect(page.locator("#callout")).toContainText(spanish ? "AVIÓN DERRIBADO" : "PLANE DOWN");
  await expect(page.locator("#wreckCount")).toContainText("1");
  expect(errors).toEqual([]);
});

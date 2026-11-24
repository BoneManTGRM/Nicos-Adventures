import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("the world map opens a styled and playable fishing game if external code requests fail", async ({ page }) => {
  await page.goto("/");
  const fishing = page.getByTestId("open-starfall-anglers");
  await expect(fishing).toBeVisible();
  await page.route(/\/games\/starfall-anglers\/[^/?]+\.(js|css)(\?|$)/, route => route.abort());
  await fishing.click();
  await expect(page).toHaveURL(/\/games\/starfall-anglers\/$/);
  await expect(page.locator("#spotPicker option").first()).toBeAttached();
  await expect(page.locator(".top-inner")).toHaveCSS("display", "flex");
  await page.locator("#sharkOpen").click();
  await expect(page.getByRole("dialog").getByRole("article")).toHaveCount(6);
});

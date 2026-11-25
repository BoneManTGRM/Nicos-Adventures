import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("Timberline opens from the map, plays a hunt and returns to the game arcade", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("open-timberline-hunt").click();
  await expect(page).toHaveURL(/\/games\/timberline-hunt\/$/);
  await expect(page).toHaveTitle("Timberline Hunt");
  await page.getByRole("button", { name: "Hunt now", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause hunt" })).toBeVisible();
  await page.getByRole("button", { name: "Finish hunt" }).click();
  await expect(page.getByRole("heading", { name: "Hunt complete" })).toBeVisible();
  await page.locator("#arcade-return").click();
  await expect(page.getByTestId("open-timberline-hunt")).toBeVisible();
  await expect(page.getByTestId("open-starfall-anglers")).toBeVisible();
  await expect(page.getByTestId("open-monster-garage")).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("a direct link opens Number Dash and exit returns to the arcade", async ({ page }, testInfo) => {
  test.skip(!["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name));
  await page.goto("/?play=number-dash");
  await expect(page.getByTestId("signal-run")).toBeVisible();
  await expect(page.locator(".monster-arcade-entry")).toBeHidden();
  await page.getByTestId("signal-run").getByRole("button", { name: /All games|Todos los juegos/ }).click();
  await expect(page).not.toHaveURL(/play=number-dash/);
  await expect(page.getByTestId("open-signal-run")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("open-signal-run")).toBeVisible();
});

test("Number Dash teaches math with live feedback and saves checkpoints on phone and desktop", async ({ page }, testInfo) => {
  test.skip(!["chromium-desktop-en", "webkit-iphone-es"].includes(testInfo.project.name));
  const es = testInfo.project.metadata.language === "es-MX";
  await page.goto("/");
  if (es) await page.getByRole("button", { name: "Cambiar a español de México" }).click();
  await page.locator(".fw-destination-grid > .fw-destination").filter({ hasText: es ? "Sala de juegos" : "Game Arcade" }).click();
  await page.getByTestId("open-signal-run").click();
  const game = page.getByTestId("signal-run");
  await expect(game).toBeVisible();
  await expect(page.locator(".monster-arcade-entry")).toBeHidden();
  await expect(game).toContainText(es ? "Carrera de números" : "Number Dash");
  const solve = async () => {
    const prompt = await game.getByTestId("dash-question").innerText();
    const match = prompt.match(/(\d+) ([+−×]) (\d+)/);
    expect(match).not.toBeNull();
    const a = Number(match![1]), b = Number(match![3]);
    const answer = match![2] === "+" ? a + b : match![2] === "−" ? a - b : a * b;
    await game.getByRole("button", { name: new RegExp(`^[123]: ${answer}$`) }).click();
    await expect(game.getByRole("status")).toContainText(es ? "¡Correcto!" : "Nice hit!");
  };
  for (let index = 0; index < 5; index++) {
    await solve();
    if (index < 4) await expect(game.getByRole("button", { name: /^[123]:/ }).first()).toBeEnabled();
  }
  await expect(game.getByText("⭐ 1/12")).toBeVisible();
  await expect(game.getByText(es ? /Etapa 2\/12/ : /Stage 2\/12/)).toBeVisible();
  await game.getByRole("button", { name: es ? "Todos los juegos" : "All games" }).click();
  await page.getByTestId("open-signal-run").click();
  await expect(page.getByTestId("signal-run").getByText(es ? /Etapa 2\/12/ : /Stage 2\/12/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true);
  const choices = game.locator(".signal-run__gates button");
  await expect(choices).toHaveCount(3);
  if (es) {
    const bounds = await choices.last().boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(testInfo.project.use.viewport!.width + 2);
  }
});

import { expect, test } from "@playwright/test";

test("Skullwing accepts touch and keyboard attacks and returns to city selection", async ({ page }, info) => {
  const spanish = info.project.metadata.language === "es-MX";
  const touch = info.project.use.hasTouch === true;
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  // Exercise the normal game path. The original illustration can also play
  // every move if the painted sheet fails to load.
  await page.addInitScript(() => {
    const prototype = CanvasRenderingContext2D.prototype;
    const original = prototype.drawImage;
    prototype.drawImage = new Proxy(original, {
      apply(target, ctx: CanvasRenderingContext2D, args) {
        const image = args[0];
        if (ctx.canvas.id === "world" && image instanceof HTMLImageElement && image.naturalWidth) {
          const flags = ctx.canvas.dataset;
          if (image.currentSrc.endsWith("/skullwing-painted.webp")) flags.paintedCharacterSeen = "yes";
          if (image.currentSrc.endsWith("/skullwing-hindlegs.webp")) flags.paintedLegsSeen = "yes";
          if (flags.paintedCharacterSeen && flags.paintedLegsSeen) prototype.drawImage = original;
        }
        return Reflect.apply(target, ctx, args);
      },
    });
  });
  await page.goto("/games/skullwing/?lang=" + (spanish ? "es-MX" : "en"));
  const start = page.getByRole("button", { name: spanish ? "Aplasta la ciudad" : "Smash the city" });
  await start.click();
  await expect(page.locator("#world")).toHaveAttribute("data-painted-character-seen", "yes");
  await expect(page.locator("#world")).toHaveAttribute("data-painted-legs-seen", "yes");
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

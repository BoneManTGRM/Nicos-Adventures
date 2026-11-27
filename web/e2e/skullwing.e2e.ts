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
          if (image.currentSrc.endsWith("/vehicles.webp")) flags.paintedVehiclesSeen = "yes";
          if (flags.paintedCharacterSeen && flags.paintedLegsSeen && flags.paintedVehiclesSeen) prototype.drawImage = original;
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
  await expect(page.locator("#world")).toHaveAttribute("data-painted-vehicles-seen", "yes");
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

test("the first smash launches traffic into a building and counts the wrecks", async ({ page }, info) => {
  const spanish = info.project.metadata.language === "es-MX";
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/games/skullwing/?lang=" + (spanish ? "es-MX" : "en"));
  await page.locator("#start").click();
  await expect(page.locator("#wreckCount")).toBeHidden();
  if (info.project.use.hasTouch) await page.locator('[data-action="attack"]').tap();
  else await page.keyboard.press("x");
  await expect(page.locator("#wreckCount")).toHaveText(spanish ? /Destrozos [1-9]/ : /Wrecks [1-9]/);
  await expect(page.locator("#clearCount")).toHaveText("1 / 12");
  await expect(page.locator("#world")).toBeVisible();
  await expect(page.locator("#score")).not.toHaveText("0");
  expect(errors).toEqual([]);
});

test("all cities are selectable and Hard can defeat and restart Skullwing", async ({ page }, info) => {
  const spanish = info.project.metadata.language === "es-MX";
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = new Proxy(draw, {
      apply(target, ctx: CanvasRenderingContext2D, args) {
        const image = args[0];
        if (ctx.canvas.id === "world" && image instanceof HTMLImageElement && image.currentSrc.endsWith("/orbit.webp")) {
          ctx.canvas.dataset.orbitPainted = "yes";
          CanvasRenderingContext2D.prototype.drawImage = draw;
        }
        return Reflect.apply(target, ctx, args);
      },
    });
  });
  await page.goto("/games/skullwing/?lang=" + (spanish ? "es-MX" : "en"));
  await expect(page.locator(".district-card")).toHaveCount(9);
  await expect(page.locator("#easy")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#hard").click();
  await page.getByRole("button", {name: spanish ? "Ciudad Orbital" : "Orbit City"}).click();
  await page.locator("#launchCity").click();
  await expect(page.locator("#districtName")).toHaveText(spanish ? "Ciudad Orbital" : "Orbit City");
  await expect(page.locator("#clearCount")).toHaveText("0 / 19");
  await expect(page.locator("#hpText")).toContainText("5 / 5");
  await expect(page.locator("#world")).toHaveAttribute("data-orbit-painted", "yes");
  await expect(page.locator("#hpText")).toContainText("4 / 5", {timeout: 11000});
  await expect(page.locator("#dialogTitle")).toHaveText(spanish ? "¡Skullwing cayó!" : "Skullwing is down!", {timeout: 27000});
  await page.getByRole("button", {name: spanish ? "Reintentar" : "Try again"}).click();
  await expect(page.locator("#hpText")).toContainText("5 / 5");
  await page.locator("#pause").click();
  await page.getByRole("button", {name: spanish ? "Elegir ciudad" : "City select"}).click();
  await page.locator("#easy").click();
  await page.locator("#launchCity").click();
  await expect(page.locator("#health")).toBeHidden();
  await expect(page.locator("#districtName")).toHaveText(spanish ? "Ciudad Orbital" : "Orbit City");
  expect(errors).toEqual([]);
});

test("Skullwing picks up a pedestrian and eats on a second press", async ({ page }, info) => {
  const es = info.project.metadata.language === "es-MX";
  await page.goto("/games/skullwing/?mode=easy&lang=" + (es ? "es-MX" : "en"));
  await page.locator("#start").click();
  const button = page.locator('[data-action="grab"]');
  const useMove = () => info.project.use.hasTouch ? button.tap() : page.keyboard.press("e");
  await expect(button).toHaveAccessibleName(es ? "Agarrar" : "Grab");
  await useMove();
  await expect(button).toHaveAccessibleName(es ? "Comer" : "Eat");
  await expect(page.locator("#score")).toHaveText("0");
  await useMove();
  await expect(page.locator("#score")).toHaveText("75");
  await expect(button).toHaveAccessibleName(es ? "Agarrar" : "Grab");
});

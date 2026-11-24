import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block", locale: "en-US" });

test("a touch hunt requires a separate net cast, saves the trophy, and returns to fishing", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/games/starfall-anglers/#hunting");
  await expect(page.getByRole("heading",{name:"Starfall Hunting"})).toBeVisible();
  await page.getByRole("button",{name:"Moon Stag",exact:true}).click();
  await expect(page.getByRole("button",{name:"Track Moon Stag"})).toBeDisabled();
  await page.getByRole("button",{name:"Red Fox",exact:true}).click();
  await page.getByRole("button",{name:"Track Red Fox"}).click();
  const clue=await page.locator(".trail-sequence").innerText();
  const order=clue.match(/Leaf|Moon|Star/g)!;
  expect(order).toHaveLength(2);
  for(const mark of order) await page.getByRole("button",{name:mark,exact:true}).click();

  await expect(page.locator(".trail-hunt")).toHaveAttribute("data-phase","chase");
  const cast=page.getByRole("button",{name:"Cast star net"});
  await expect(cast).toBeEnabled();
  await cast.click();
  await expect(page.getByText("Tagged & released",{exact:true})).toBeVisible();
  await page.reload();
  const journal=page.locator(".trail-journal");
  await expect(journal.locator("summary")).toContainText("1/9");
  await journal.locator("summary").click();
  await expect(journal.locator(".trail-record").filter({hasText:"Red Fox"})).toContainText("Tags 1 · Best 100/100");
  await page.getByRole("button",{name:"Close",exact:true}).click();
  await expect(page.getByRole("button",{name:"Cast line",exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/games\/starfall-anglers\/$/);
});

async function findAnimal(page: Page, tryDecoy = false) {
  const target = (await page.locator(".trail-panel h3").innerText()).replace(/^Find /, "");
  const slider = page.getByRole("slider", {name: "Pan binoculars"});
  const identify = page.getByRole("button", {name: "Identify animal"});
  if (tryDecoy) {
    for (const value of ["26", "50", "74"]) {
      await slider.fill(value);
      if (await slider.getAttribute("aria-valuetext") !== "In view · " + target) {
        await identify.click();
        await expect(page.locator(".trail-message")).toContainText("Keep looking for " + target);
        break;
      }
    }
  }
  for (const value of ["26", "50", "74"]) {
    await slider.fill(value);
    if (await slider.getAttribute("aria-valuetext") === "In view · " + target) {
      await identify.click();
      await expect(page.locator(".trail-hunt")).toHaveAttribute("data-phase", "chase");
      return target;
    }
  }
  throw new Error("Could not find " + target + " in the clearing");
}

test("the daily rally resumes after reload and records only the three completed sightings", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/games/starfall-anglers/#hunting");
  await page.getByRole("button", {name: "Start rally"}).click();
  const animals = new Set<string>();
  for (let leg = 1; leg <= 3; leg++) {
    animals.add(await findAnimal(page, leg === 1));
    await page.getByRole("button", {name: "Cast star net"}).click();
    await expect(page.locator(".trail-rally-score")).toContainText(leg + "/3");
    if (leg === 1) {
      await page.reload();
      await page.getByRole("button", {name: "Continue rally"}).click();
    } else if (leg === 2) {
      await page.getByRole("button", {name: "Next rally stop"}).click();
    }
  }
  expect(animals.size).toBe(3);
  await page.getByRole("button", {name: "Choose a hunt"}).click();
  await expect(page.locator(".trail-rally")).toContainText("Best rally 295/300");
  await expect(page.locator(".trail-rally button")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".trail-rally")).toContainText("Today’s score 295/300");
});

test("returning players can use all three gifts and replay a legendary encounter", async ({page, hasTouch}) => {
  await page.emulateMedia({reducedMotion: "no-preference"});
  await page.addInitScript(() => {
    const key = "nicos-world.starfall-anglers.v1";
    if (!localStorage.getItem(key)) {
      const records = Object.fromEntries(["moonstag", "lynx", "sunjaguar"].map(id => [id, {count: 2, best: 98}]));
      localStorage.setItem(key, JSON.stringify({lang: "en", calm: false, trails: {records}}));
    }
  });
  await page.goto("/games/starfall-anglers/#hunting");
  const button = (name: string) => page.getByRole("button", {name, exact: true});
  async function equip(id: string) {
    const shelf = page.locator(".trail-gifts");
    if (await shelf.getAttribute("open") === null) await shelf.locator("summary").click();
    const item = shelf.locator('[data-equip="' + id + '"]');
    await item.click();
    await expect(item).toHaveAttribute("aria-pressed", "true");
  }
  await equip("moonstag");
  await button("Track Red Fox").click();
  const bell = button("Ring Moon Bell");
  await bell.click();
  await expect(page.locator(".trail-mark.glow")).toHaveCount(1);
  await expect(bell).toBeDisabled();
  await button("Leave hunt").click();

  await equip("lynx");
  await button("Scout with binoculars").click();
  await findAnimal(page);
  await button("Slow time").click();
  await expect(page.locator(".trail-stage")).toHaveClass(/trail-frozen/);
  await expect(button("Slow time")).toBeDisabled();
  await expect(page.locator(".trail-stage")).not.toHaveClass(/trail-frozen/, {timeout: 9000});
  await button("Leave hunt").click();

  await equip("sunjaguar");
  await page.reload();
  await page.getByLabel("Relaxed timing").check();
  await button("Scout with binoculars").click();
  await findAnimal(page);
  await expect(page.locator(".trail-ring")).toHaveClass(/sunweave/);
  expect(await page.locator(".trail-ring").evaluate(ring => (ring as HTMLElement).style.width)).toBe("40.5%");
  const stage = (await page.locator(".trail-stage").boundingBox())!;
  const y = stage.y + stage.height * .72;
  const nearLeft = stage.x + stage.width * .12;
  if (hasTouch) await page.touchscreen.tap(nearLeft, y);
  else await page.mouse.click(nearLeft, y);
  await expect(page.locator(".trail-casts")).toHaveText("Casts · 2/3");
  const center = stage.x + stage.width * .5;
  if (hasTouch) await page.touchscreen.tap(center, y);
  else await page.mouse.click(center, y);
  await expect(page.getByText("Tagged & released", {exact: true})).toBeVisible();
  await page.locator(".trail-journal summary").click();
  await button("View encounter · Moon Stag").click();
  await expect(page.locator(".trail-stage")).toHaveClass(/trail-postcard-moonstag/);
  await button("Back to journal").click();
  await expect(page.locator(".trail-record").filter({hasText: "Moon Stag"})).toContainText("Tags 2 · Best 98/100");
});

import { expect, test } from "@playwright/test";

test("Skullwing accepts touch and keyboard attacks and returns to city selection", async ({ page }, info) => {
  const spanish = info.project.metadata.language === "es-MX";
  const touch = info.project.use.hasTouch === true;
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  // Exercise the normal game path. Verify the articulated monster and street art are painted in the playfield.
  await page.addInitScript(() => {
    const prototype = CanvasRenderingContext2D.prototype;
    const original = prototype.drawImage;
    prototype.drawImage = new Proxy(original, {
      apply(target, ctx: CanvasRenderingContext2D, args) {
        const image = args[0];
        if (ctx.canvas.id === "world" && image instanceof HTMLImageElement && image.naturalWidth) {
          const flags = ctx.canvas.dataset;
          if (image.currentSrc.endsWith("/skullwing-joints.webp")) flags.paintedCharacterSeen = "yes";
          if (image.currentSrc.endsWith("/street-people.webp")) flags.paintedPeopleSeen = "yes";
          if (image.currentSrc.endsWith("/vehicles.webp")) flags.paintedVehiclesSeen = "yes";
          if (flags.paintedCharacterSeen && flags.paintedPeopleSeen && flags.paintedVehiclesSeen) prototype.drawImage = original;
        }
        return Reflect.apply(target, ctx, args);
      },
    });
  });
  await page.goto("/games/skullwing/?lang=" + (spanish ? "es-MX" : "en"));
  const start = page.getByRole("button", { name: spanish ? "Aplasta la ciudad" : "Smash the city" });
  await start.click();
  await expect(page.locator("#world")).toHaveAttribute("data-painted-character-seen", "yes");
  await expect(page.locator("#world")).toHaveAttribute("data-painted-people-seen", "yes");
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

test("select Nacho, throw traffic and people, then belly flop", async ({page}, info)=>{
  const es=info.project.metadata.language==="es-MX";
  await page.addInitScript(() => {
    const proto = CanvasRenderingContext2D.prototype;
    const original = proto.drawImage;
    proto.drawImage = new Proxy(original, {
      apply(target, ctx: CanvasRenderingContext2D, args) {
        const image = args[0];
        let labels: string[] = [];
        if (image instanceof HTMLImageElement) {
          const name = image.currentSrc.split("/").pop();
          if (name === "nacho-joints.webp") labels = ["joints"];
          if (name === "nacho-lift0.webp" || name === "nacho-combat.webp") labels = ["lift"];
          if (name === "nacho-splash.webp") labels = ["splash"];
          if (name === "nacho-air0.webp") labels = ["air"];
        } else if (image instanceof HTMLCanvasElement) {
          labels = Object.keys(image.dataset).filter(k => k.startsWith("observed")).map(k => k.slice(8));
        }
        for (const label of labels) ctx.canvas.dataset["observed" + label] = "yes";
        return Reflect.apply(target, ctx, args);
      },
    });
  });
  await page.goto("/games/skullwing/?mode=easy&lang="+(es?"es-MX":"en"));
  await page.getByRole("button",{name:"Nacho",exact:true}).click();
  await expect(page.locator("#nacho")).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("img#nachoPoster")).toBeVisible();
  await page.locator("#start").click();
  const world = page.locator("#world");
  await expect(world).toHaveAttribute("data-observedjoints","yes");
  const move=(action:string,key:string)=>info.project.use.hasTouch?page.locator('[data-action="'+action+'"]').tap():page.keyboard.press(key);
  await move("grab","e");
  await expect(page.locator('[data-action="grab"]')).toHaveAccessibleName(es?"Lanzar auto":"Throw car");
  await move("grab","e");
  await expect(page.locator("#wreckCount")).toBeVisible();
  await expect(world).toHaveAttribute("data-observedlift","yes");
  await move("roar","c");
  await expect(page.locator('[data-action="roar"]')).toHaveAccessibleName(es?"Lanzar persona":"Throw person");
  await move("roar","c");
  await expect(page.locator("#callout")).toContainText(es?"POR LOS AIRES":"FLYING TOSS");
  await move("jump","Space");
  await expect(page.locator("#smashName")).toHaveText(es?"Plancha":"Flop");
  await move("attack","x");
  await expect(page.locator("#callout")).toContainText(es?"PLANCHAZO":"BELLY FLOP");
  await expect(world).toHaveAttribute("data-observedsplash","yes");
  await expect(world).toHaveAttribute("data-observedair","yes");
});

for (const monster of ["skullwing","nacho"]) {
  test(monster+" rips a standing tower, hurls the wall and eats a car",async({page},info)=>{
    const es=info.project.metadata.language==="es-MX";
    await page.goto("/games/skullwing/?monster="+monster+"&mode=easy&lang="+(es?"es-MX":"en"));
    const start=page.locator("#start");
    const move=(action:string,key:string)=>info.project.use.hasTouch?page.locator('[data-action="'+action+'"]').tap():page.keyboard.press(key);
    await start.click();
    await move("tear","r");
    await expect(page.locator("#callout")).toContainText(es?"MURO ARRANCADO":"WALL RIPPED");
    await expect(page.locator("#tearName")).toHaveText(es?"Lanzar":"Hurl");
    await move("tear","r");
    await expect(page.locator("#tearName")).toHaveText(es?"Arrancar":"Rip wall");
    await page.locator("#pause").click();
    await page.getByRole("button",{name:es?"Elegir ciudad":"City select"}).click();
    await start.click();
    await move(monster==="nacho"?"grab":"extra",monster==="nacho"?"e":"f");
    await move(monster==="nacho"?"extra":"grab",monster==="nacho"?"f":"e");
    await expect(page.locator("#score")).toHaveText("125");
    await expect(page.locator("#wreckCount")).toContainText("1");
  });
}

for (const monster of ["skullwing", "nacho"]) {
  test(monster + " swings both arms and bends both legs on the street", async ({page}) => {
    await page.goto("/games/skullwing/?monster=" + monster);
    await page.evaluate(async monster => {
      const modulePath = "/games/skullwing/motion/joints.mjs";
      const {parts} = await import(modulePath);
      const tiles = parts[monster];
      const names = ["upper", "farUpper", "thigh", "farThigh"];
      const byRect = new Map(names.map(name => [tiles[name].rect.join(","), name]));
      const angles = new Map(names.map(name => [name, new Set<number>()]));
      const original = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = new Proxy(original, {
        apply(target, ctx: CanvasRenderingContext2D, args) {
          if (ctx.canvas.id === "world" && args[0] instanceof HTMLImageElement &&
              args[0].currentSrc.endsWith(monster + "-joints.webp")) {
            const limb = byRect.get(args.slice(1,5).join(","));
            if (limb) {
              const t = ctx.getTransform();
              angles.get(limb)!.add(Math.round(Math.atan2(t.b,t.a)*180/Math.PI));
              if (names.every(n => angles.get(n)!.size >= 8)) ctx.canvas.dataset.limbsMoving = "yes";
            }
          }
          return Reflect.apply(target,ctx,args);
        }
      });
    },monster);
    await page.locator("#start").click();
    const right = page.locator('[data-action="right"]');
    await right.hover();
    await page.mouse.down();
    try { await expect(page.locator("#world")).toHaveAttribute("data-limbs-moving","yes"); }
    finally { await page.mouse.up(); }
  });
}

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
  const oldArtwork: string[] = [];
  page.on("request", request => {
    if (/\/(?:motion\/nacho-(?:air|lift|bite|fight|carry)|nacho-(?:splash|combat|landing|stride)\.webp)/.test(request.url())) oldArtwork.push(request.url());
  });
  await page.goto("/games/skullwing/?mode=easy&lang="+(es?"es-MX":"en"));
  await page.evaluate(async () => {
    const modulePath="/games/skullwing/motion/joints.mjs";
    const {nacho}=(await import(modulePath)).parts;
    const proto=CanvasRenderingContext2D.prototype,original=proto.drawImage;
    let headTop=0;
    proto.drawImage=new Proxy(original,{
      apply(target,ctx:CanvasRenderingContext2D,args){
        const image=args[0],canvas=ctx.canvas;
        if(canvas.id==="world"&&image instanceof HTMLImageElement&&image.currentSrc.endsWith("/nacho-joints.webp")){
          const rect=args.slice(1,5).join(","),t=ctx.getTransform();
          if(rect===nacho.body.rect.join(",")){
            canvas.dataset.observedjoints="yes";
            headTop=t.f+t.d*args[6];
            const pitch=Math.abs(Math.atan2(t.b,t.a));
            if(pitch>1.05)canvas.dataset.horizontal="yes";
            if(canvas.dataset.horizontal&&pitch<.16)canvas.dataset.uprightAgain="yes";
          }
          if(rect===nacho.fore.rect.join(",")){
            const dx=nacho.fore.end[0]-nacho.fore.start[0],dy=nacho.fore.end[1]-nacho.fore.start[1];
            if(t.f+t.b*dx+t.d*dy<headTop)canvas.dataset.overhead="yes";
          }
        }
        return Reflect.apply(target,ctx,args);
      }
    });
  });
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
  await expect(world).toHaveAttribute("data-overhead","yes");
  await move("roar","c");
  await expect(page.locator('[data-action="roar"]')).toHaveAccessibleName(es?"Lanzar persona":"Throw person");
  await move("roar","c");
  await expect(page.locator("#callout")).toContainText(es?"POR LOS AIRES":"FLYING TOSS");
  await move("jump","Space");
  await expect(page.locator("#smashName")).toHaveText(es?"Plancha":"Flop");
  await move("attack","x");
  await expect(page.locator("#callout")).toContainText(es?"PLANCHAZO":"BELLY FLOP");
  await expect(world).toHaveAttribute("data-horizontal","yes");
  await expect(world).toHaveAttribute("data-upright-again","yes");
  expect(oldArtwork).toEqual([]);
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
      const tilesDrawn = new WeakMap<HTMLCanvasElement,Map<string,number>>();
      function record(canvas: HTMLCanvasElement, limb: string, angle: number) {
        if (canvas.id === "world") {
          angles.get(limb)!.add(angle);
          if (names.every(n => angles.get(n)!.size >= 8)) canvas.dataset.limbsMoving = "yes";
        } else {
          let joints = tilesDrawn.get(canvas);
          if (!joints) { joints = new Map(); tilesDrawn.set(canvas,joints); }
          joints.set(limb,angle);
        }
      }
      const original = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = new Proxy(original, {
        apply(target, ctx: CanvasRenderingContext2D, args) {
          const image = args[0];
          if (image instanceof HTMLImageElement && image.currentSrc.endsWith(monster + "-joints.webp")) {
            const limb = byRect.get(args.slice(1,5).join(","));
            if (limb) {
              const t = ctx.getTransform();
              record(ctx.canvas,limb,Math.round(Math.atan2(t.b,t.a)*180/Math.PI));
            }
          } else if (image instanceof HTMLCanvasElement) {
            // Count a cached joint pose only when it actually reaches the playfield.
            tilesDrawn.get(image)?.forEach((angle,limb) => record(ctx.canvas,limb,angle));
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

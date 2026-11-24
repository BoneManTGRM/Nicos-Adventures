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
  const narrow = await page.evaluate(() => window.matchMedia("(max-width: 560px)").matches);
  await expect(page.locator(".top-inner")).toHaveCSS("display", narrow ? "grid" : "flex");
  await page.locator("#sharkOpen").click();
  await expect(page.getByRole("dialog").getByRole("article")).toHaveCount(6);
});

test("aquarium dives draw the fish and restore the selected resident",async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem("nicos-world.starfall-anglers.v1",JSON.stringify({lang:"en",records:{brook:{n:1,best:1}},display:["brook"],fishHomes:{brook:"fresh"}}));
    const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(img:CanvasImageSource,...coords:number[]){
      if(this.canvas.matches(".bw-map")&&img instanceof HTMLImageElement&&img.src.endsWith(".png"))this.canvas.dataset.drewFish="yes";
      return Reflect.apply(draw,this,[img,...coords]);
    };
  });
  await page.goto("/games/starfall-anglers/");
  await page.locator("#tabTank").click();
  await page.getByRole("button",{name:"Resident shoal",exact:true}).click();
  await page.locator(".keeper-fish-row button").nth(2).click();
  const fish=await page.locator(".keeper-identity h3").innerText();
  for(const name of ["Dive into tank","Design your tank"]){
    await page.getByRole("button",{name,exact:true}).click();
    await expect(page.locator(".bw-map")).toHaveAttribute("data-drew-fish","yes");
    await page.getByRole("button",{name:"Back to aquarium",exact:true}).click();
    await expect(page.locator(".keeper-identity h3")).toHaveText(fish);
    await expect(page.getByRole("button",{name:"Resident shoal",exact:true})).toHaveAttribute("aria-pressed","true");
  }
});

test("retired hunting bookmarks open fishing and keep existing collections on save", async ({page})=>{
  await page.addInitScript(()=>{
    const key="nicos-world.starfall-anglers.v1";
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({
      lang:"en",records:{brook:{n:2,best:1.4}},display:["brook"],fishHomes:{brook:"fresh"},
      trails:{records:{fox:{count:3,best:98}}},expedition:{clues:[1,0,0]}
    }));
  });
  const fishing="/games/starfall-anglers/?from=bookmark";
  for(const link of ["#hunting","#expedition"]){
    await page.goto(fishing+link);
    await expect(page).toHaveURL(url=>url.pathname==="/games/starfall-anglers/"&&url.search==="?from=bookmark"&&!url.hash);
    await expect(page.locator("#tabFish")).toHaveClass(/active/);
    await expect(page.getByRole("button",{name:"Cast line",exact:true})).toBeVisible();
    await expect(page.locator("#tabHunt,dialog[open]")).toHaveCount(0);
  }
  await page.locator("#sound").click();
  const save=await page.evaluate(()=>JSON.parse(localStorage.getItem("nicos-world.starfall-anglers.v1")!));
  expect(save.records.brook).toMatchObject({n:2,best:1.4});
  expect(save.fishHomes.brook).toBe("fresh");
  expect(save.trails.records.fox).toEqual({count:3,best:98});
  expect(save.expedition.clues).toEqual([1,0,0]);
});

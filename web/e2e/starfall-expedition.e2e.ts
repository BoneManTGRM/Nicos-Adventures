import { expect, test } from "@playwright/test";

test.use({locale: "en-US", serviceWorkers: "block"});

test("the arcade expedition earns all guardians, develops real photos and brings Starwing home", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/");
  await page.getByTestId("open-starfall-expedition").click();
  await expect(page).toHaveURL(/#expedition$/);
  const button=(name:string)=>page.getByRole("button",{name,exact:true});
  const stage=page.locator(".exp-world");
  const state=(view:string)=>expect(stage).toHaveAttribute("data-expedition",view);
  const shot=button("Take photo");
  await button("Trail atlas").click();
  await expect(page.getByRole("button",{name:/Sky Gate/})).toBeDisabled();
  await page.getByRole("button",{name:/Firefly Pines/}).click();
  const areas=[
    {sites:["Hollow log","Moon pool","Hollow oak"],animals:["Red Fox","Roe Deer"],signs:["Leaf","Moon","Star"],next:"Explore Aurora Ridge"},
    {sites:["Ice arch","Violet crystal","Frozen pool"],animals:["Snow Hare","Gray Wolf"],signs:["Crystal","Moon","Snowflake"],next:"Explore Canyon of the Sun"},
    {sites:["Plank bridge","Sunstone","Hidden spring"],animals:["Armadillo","Roadrunner"],signs:["Blossom","Crystal","Sun"],next:"Open the Sky Gate"}
  ];
  for (const [index,area] of areas.entries()) {
    for(const animal of area.animals) await button("Observe "+animal).click();
    if(index<2)await button("Follow the wisp trail").click();
    await button(area.sites[0]).click();
    if(index===0){
      await page.reload();
      await expect(page.locator(".exp-notes summary")).toContainText("1/2");
    }
    await button("Walk to "+area.sites[1]).click();
    await button(area.sites[2]).click();
    await state("runes");
    if(index===0){
      await button("Star").click();
      await expect(page.locator(".exp-status")).toContainText("flickered");
    }
    for(const sign of area.signs) await button(sign).click();
    await state("camera");
    const aim=page.getByRole("slider",{name:"Aim camera"});
    await aim.fill("10");await shot.click();
    await expect(page.locator(".exp-status")).toContainText("outside the frame");
    await aim.fill("50");await shot.click();
    await expect(page.locator(".exp-print figcaption")).toContainText("★★★");
    await expect(page.getByRole("link",{name:"Save photo (PNG)"})).toHaveAttribute("href",/^blob:/);
    await button(area.next).click();
  }
  await state("gate");await button("Meet Starwing").click();await shot.click();
  const file=page.getByRole("link",{name:"Save photo (PNG)"});
  await expect(file).toHaveAttribute("href",/^blob:/);
  const downloaded=page.waitForEvent("download");
  await file.click();
  expect((await downloaded).suggestedFilename()).toBe("nico-starwing-griffin.png");
  await button("Walk with Starwing").click();
  await expect(page.locator(".exp-friend")).toBeVisible();
  await button("Call Starwing").click();
  await expect(page.locator(".exp-status")).toContainText("gold frame");
  await page.reload();
  await button("Photo album").click();
  await expect(page.locator(".exp-body")).toContainText("4/4 portraits · 3/3 wisps · 6/6 wildlife sightings");
  await button("Starwing Griffin").click();
  await expect(page.locator(".exp-print figcaption")).toContainText("★★★");
  const goldPixel=await page.locator(".exp-print canvas").evaluate(node=>{
    return Array.from((node as HTMLCanvasElement).getContext("2d")!.getImageData(5,5,1,1).data);
  });
  expect(goldPixel).toEqual([237,200,108,255]);
  await button("Trail atlas").click();await button("Hunting lodge").click();
  await expect(page).toHaveURL(/#hunting$/);
  await expect(button("Start rally")).toBeEnabled();
  await button("Starlight Expedition").click();await expect(page).toHaveURL(/#expedition$/);
  await button("Close").click();await expect(button("Cast line")).toBeVisible();
});

test("keyboard walking and the Spanish camera work with normal motion", async ({page})=>{
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto("/games/starfall-anglers/#expedition");
  const map=page.locator(".exp-map");
  const walker=page.locator(".exp-walker");
  await map.focus();await map.press("ArrowRight");
  await expect.poll(()=>walker.evaluate(el=>parseFloat((el as HTMLElement).style.left))).toBeGreaterThan(55);
  await page.locator(".trail-lang").click();
  await page.getByRole("button",{name:"Caminar a Tronco hueco"}).click();
  await page.getByRole("button",{name:"Caminar a Poza lunar"}).click();
  await page.getByRole("button",{name:"Caminar a Roble hueco"}).click();
  for(const name of ["Hoja","Luna","Estrella"])await page.getByRole("button",{name,exact:true}).click();
  const canvas=page.locator(".exp-viewfinder canvas");
  await expect(page.getByRole("button",{name:"Tomar foto"})).toBeEnabled();
  const pixels=()=>canvas.evaluate(el=>(el as HTMLCanvasElement).toDataURL());
  const first=await pixels();await expect.poll(async()=>await pixels()!==first).toBe(true);
  await page.getByLabel("Pose quieta").check();
  await page.getByRole("button",{name:"Tomar foto"}).click();
  await expect(page.locator(".exp-print figcaption")).toContainText("Ciervo lunar · ★★★");
});

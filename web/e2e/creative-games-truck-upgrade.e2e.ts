import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {normalizeGames,type CreativeGamesSave} from '../src/creativeGames/save';
import {makeDrive} from '../src/creativeGames/carPhysics';
const key='nicos-world-local-save-v4';
const spanish=(info:TestInfo)=>info.project.metadata.language==='es-MX';
async function current(page:Page):Promise<CreativeGamesSave>{return page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames;},key);}
async function enter(page:Page,info:TestInfo,games=normalizeGames(null)){
 await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,games,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);p.selectedSection='game-arcade';p.language=language;p.creativeGames=games;p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,games,language:info.project.metadata.language});
 await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('garage-drive')).toBeVisible();
}
async function freeze(page:Page){await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+2000));}
async function pointDown(page:Page,selector:string){const r=await page.locator(selector).boundingBox();expect(r).not.toBeNull();await page.mouse.move(r!.x+r!.width/2,r!.y+r!.height/2);await page.mouse.down();}

test('the actual turbo pedal accelerates, spends charge, recharges and pauses safely',async({page},info)=>{
 await page.clock.install();await enter(page,info);await freeze(page);await page.getByTestId('garage-drive').click();
 await pointDown(page,'[data-control="boost"]');await page.clock.runFor(1200);await page.mouse.up();await page.clock.runFor(120);
 const charge=Number((await page.getByTestId('garage-turbo-charge').innerText()).replace('%',''));
 expect(charge).toBeLessThan(98);expect(charge).toBeGreaterThan(0);
 expect(Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''))).toBeGreaterThan(5);
 await page.clock.runFor(300);expect(Number((await page.getByTestId('garage-turbo-charge').innerText()).replace('%',''))).toBeGreaterThan(charge);
 await page.getByTestId('garage-pause').click();const frozen=await page.getByTestId('garage-turbo-charge').innerText();await page.clock.runFor(2000);await expect(page.getByTestId('garage-turbo-charge')).toHaveText(frozen);
 const before=(await current(page)).garage;expect(before.resume!.boostCharge!).toBeLessThan(100);expect(before.owned).toEqual(normalizeGames(null).garage.owned);
 await info.attach('turbo-phone-controls',{body:await page.screenshot(),contentType:'image/png'});
 await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();
 const saved=(await current(page)).garage;expect(saved.resume!.boostCharge).toBe(before.resume!.boostCharge);expect(saved.bolts).toBe(0);
});

test('one-tap rebuild starts the same car and route without charging or double-paying',async({page},info)=>{
 const games=normalizeGames(null),r=makeDrive({...games.garage.build,name:'My stunt truck',paint:4},1,2);
 Object.assign(r,{x:600,y:-180,vy:1100,air:1,distance:42,boostCharge:25});games.garage.sequence=1;games.garage.resume=r;
 await page.clock.install();await enter(page,info,games);await freeze(page);
 await page.locator('.cg-resume').getByRole('button',{name:spanish(info)?'Continuar recorrido':'Resume drive',exact:true}).click();await page.clock.runFor(2500);
 await expect(page.locator('.cg-crash-card')).toBeVisible();
 const assertCrashBounds=async()=>{
  const bounds=await page.locator('.cg-crash-card').evaluate(card=>{const parent=card.parentElement!.getBoundingClientRect(),r=card.getBoundingClientRect();return {top:r.top-parent.top,bottom:parent.bottom-r.bottom};});
  expect(bounds.top).toBeGreaterThanOrEqual(0);expect(bounds.bottom).toBeGreaterThanOrEqual(0);
  for(const button of await page.locator('.cg-crash-card button').all()){
   await button.scrollIntoViewIfNeeded();
   expect(await button.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit);})).toBe(true);
  }
 };
 await assertCrashBounds();await info.attach('crash-menu-portrait',{body:await page.screenshot(),contentType:'image/png'});
 const size=page.viewportSize();await page.setViewportSize({width:844,height:390});await page.clock.runFor(160);await assertCrashBounds();
 await info.attach('crash-menu-landscape',{body:await page.screenshot(),contentType:'image/png'});
 if(size)await page.setViewportSize(size);await page.clock.runFor(160);
 const paid=(await current(page)).garage;
 await page.getByTestId('garage-race-again').click();await page.clock.runFor(200);
 await expect(page.locator('.cg-crash-card')).toHaveCount(0);await expect(page.getByTestId('garage-turbo-charge')).toHaveText('100%');
 const retry=(await current(page)).garage;expect(retry.bolts).toBe(paid.bolts);expect(retry.sequence).toBe(2);expect(retry.paidThrough).toBe(1);
 expect(retry.resume!.build).toEqual(r.build);expect(retry.resume!.track).toBe(2);expect(retry.resume!.broken).toEqual([]);expect(retry.owned).toEqual(games.garage.owned);
 await info.attach('one-tap-rebuilt-car',{body:await page.screenshot(),contentType:'image/png'});
});

test('parts search and ownership filters use actual unlocks and preserve the fitted car',async({page},info)=>{
 const games=normalizeGames(null);games.garage.bolts=50;await enter(page,info,games);
 await page.getByTestId('garage-part-search').fill('lava');await expect(page.locator('[data-part-id]')).toHaveCount(1);
 await page.locator('[data-parts-filter="owned"]').click();await expect(page.locator('.cg-empty-parts')).toBeVisible();
 await page.locator('[data-parts-filter="affordable"]').click();await page.locator('[data-part-id="12"]').click();
 expect((await current(page)).garage.build.parts[1]).toBe(11);
 await expect(page.locator('.cg-preview-warning')).toBeVisible();await page.getByTestId('buy-garage-part').click();
 expect((await current(page)).garage.build.parts[1]).toBe(11);await expect(page.getByTestId('garage-bolts')).toHaveText('0');
 await page.locator('.cg-part-detail').getByRole('button',{name:spanish(info)?'Instalar pieza':'Fit this part',exact:true}).click();
 expect((await current(page)).garage.build.parts[1]).toBe(12);
 await page.locator('[data-parts-filter="owned"]').click();await expect(page.locator('[data-part-id="12"]')).toBeVisible();
 await page.getByTestId('garage-part-search').fill('');await expect(page.locator('[data-part-id]')).toHaveCount(2);
 await expect(page.locator('.cg-project-cards article')).toHaveCount(3);
 await info.attach('garage-search-and-projects',{body:await page.locator('.cg-next-projects').screenshot(),contentType:'image/png'});
 await page.reload();await page.getByTestId('open-monster-garage').click();expect((await current(page)).garage.build.parts[1]).toBe(12);
 await expect(page.locator('.cg-preview-warning')).toHaveCount(0);
});

test('the turbo, pedals and road fit both portrait and short landscape screens',async({page},info)=>{
 await enter(page,info);await page.getByTestId('garage-drive').click();
 const check=async()=>{
  const values=await page.locator('.cg-track,[data-control="gas"],[data-control="brake"],[data-control="boost"]').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{top:r.top,bottom:r.bottom,height:window.innerHeight,shown:hit===el||el.contains(hit)};}));
  expect(values).toHaveLength(4);for(const v of values){expect(v.top).toBeGreaterThanOrEqual(0);expect(v.bottom).toBeLessThanOrEqual(v.height);expect(v.shown).toBe(true);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
 };
 await check();await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);await check();
 await info.attach('truck-landscape-controls',{body:await page.screenshot(),contentType:'image/png'});
});

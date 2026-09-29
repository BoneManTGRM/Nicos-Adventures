import {expect,test} from '@playwright/test';
import {normalizeGames} from '../src/creativeGames/save';
const key='nicos-world-local-save-v4';
test('a free unowned-part trial never displays or changes a previous earned reward',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX',games=normalizeGames(null);
 games.garage.bolts=42;games.garage.sequence=1;games.garage.paidThrough=1;
 games.garage.last={distance:110,bolts:22,bonus:10,challenge:10,practice:false};
 await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,games,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);Object.assign(p,{selectedSection:'game-arcade',language,creativeGames:games});p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,games,language:es?'es-MX':'en'});
 await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.locator('.cg-receipt')).toBeVisible();
 await page.locator('[data-part-id="12"]').click();await page.locator('.cg-part-detail').getByRole('button',{name:es?'Probar gratis':'Free test drive',exact:true}).click();
 await expect(page.locator('.cg-drive')).toBeVisible();await expect(page.locator('.cg-receipt')).toHaveCount(0);await expect(page.getByTestId('garage-bolts')).toHaveText('42');
 await page.locator('.cg-return').click();
 const saved=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage;},key);
 expect(saved.bolts).toBe(42);expect(saved.owned).not.toContain(12);expect(saved.sequence).toBe(1);expect(saved.last).toEqual(games.garage.last);
});

test('the active playfield and pedals fit the viewport without site navigation covering them',async({page},info)=>{
 await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);p.selectedSection='game-arcade';p.language=language;p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,language:info.project.metadata.language});
 await page.reload();await page.getByTestId('open-monster-garage').click();await page.getByTestId('garage-drive').click();
 const check=async(selector:string)=>{
  const boxes=await page.locator(selector).evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {top:r.top,bottom:r.bottom,width:r.width,height:r.height,viewport:window.innerHeight,visible:hit===el||el.contains(hit)};}));
  expect(boxes.length).toBeGreaterThan(0);for(const b of boxes){expect(b.top).toBeGreaterThanOrEqual(0);expect(b.bottom).toBeLessThanOrEqual(b.viewport);expect(b.visible).toBe(true);}
 };
 await check('.cg-track,[data-control="gas"],[data-control="brake"]');
 const gas=await page.locator('[data-control="gas"]').boundingBox();expect(gas).not.toBeNull();
 await page.mouse.move(gas!.x+gas!.width/2,gas!.y+gas!.height/2);await page.mouse.down();await page.waitForTimeout(1600);await page.mouse.up();
 await expect.poll(async()=>Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''))).toBeGreaterThan(0);
 await info.attach('garage-actual-viewport',{body:await page.screenshot(),contentType:'image/png'});
 await page.locator('.cg-topbar button').click();await page.getByTestId('open-rainbow-kingdom').click();await page.getByTestId('kingdom-ride').click();
 await check('.cg-kingdom-canvas,[data-control="left"],[data-control="jump"],[data-control="right"]');
 await info.attach('kingdom-actual-viewport',{body:await page.screenshot(),contentType:'image/png'});
});

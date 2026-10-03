import {expect,test} from '@playwright/test';
const key='nicos-world-local-save-v4';

test('a captured gas pointer stays held when a second pedal receives focus; cancellation releases it',async({page},info)=>{
 await page.clock.install();await page.goto('/');
 await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language})=>{
  const s=JSON.parse(localStorage.getItem(key)!);
  const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);
  p.language=language;p.selectedSection='game-arcade';p.nico.speechEnabled=false;
  localStorage.setItem(key,JSON.stringify(s));
 },{key,language:info.project.metadata.language});
 await page.reload();await page.getByTestId('open-monster-garage').click();
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+2000));
 await page.getByTestId('garage-drive').click();
 const gas=page.locator('[data-control="gas"]'),boost=page.locator('[data-control="boost"]');
 const box=await gas.boundingBox();expect(box).not.toBeNull();
 await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();
 await page.clock.runFor(20);await boost.focus();await expect(boost).toBeFocused();
 await page.clock.runFor(600);
 await page.keyboard.press('Escape');
 const saved=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage.resume;},key);
 expect(saved.vx).toBeGreaterThan(100);expect(saved.distance).toBeGreaterThan(4);
 await page.mouse.up();
 await page.getByTestId('garage-pause').click();
 // Cancellation must release an actual captured pointer and never leave throttle on.
 const next=await gas.boundingBox();await page.mouse.move(next!.x+next!.width/2,next!.y+next!.height/2);await page.mouse.down();
 await gas.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});
 await page.mouse.up();
 await page.clock.runFor(1800);
 await page.keyboard.press('Escape');
 const coast=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage.resume;},key);
 expect(coast.boostActive).toBe(false);
 expect(coast.vx).toBeLessThan(saved.vx);
 await info.attach('pedals-after-focus-and-cancellation',{body:await page.screenshot(),contentType:'image/png'});
});

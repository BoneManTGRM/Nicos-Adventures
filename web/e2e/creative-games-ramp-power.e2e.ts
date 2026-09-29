import {expect,test} from '@playwright/test';
const key='nicos-world-local-save-v4';

for(const track of [0,1,2])test(`starter truck clears the second ramp using the pedal: route ${track}`,async({page},info)=>{
 await page.clock.install({time:new Date('2026-09-29T15:00:00Z')});
 await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language})=>{
  const store=JSON.parse(localStorage.getItem(key)!);
  const profile=store.profiles.find((p:{id:string})=>p.id===store.activeProfileId);
  profile.selectedSection='game-arcade';profile.language=language;profile.nico.speechEnabled=false;
  // A fresh isolated child profile: no unlocked motor, bolts, or vehicle modifications.
  localStorage.setItem(key,JSON.stringify(store));
 },{key,language:info.project.metadata.language});
 await page.reload();await page.getByTestId('open-monster-garage').click();
 await expect(page.getByTestId('garage-drive')).toBeVisible();
 await page.locator('.cg-build-panel select').selectOption(String(track));
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+5000));
 await page.getByTestId('garage-drive').click();
 const pedal=page.locator('[data-control="gas"]');const box=await pedal.boundingBox();expect(box).not.toBeNull();
 await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();
 let cleared=false;
 try{
  for(let tick=0;tick<100;tick++){
   await page.clock.runFor(250);
   const saved=await page.evaluate(key=>{
    const store=JSON.parse(localStorage.getItem(key)!);
    return store.profiles.find((p:{id:string})=>p.id===store.activeProfileId).creativeGames.garage;
   },key);
   const run=saved.resume;
   if(run&&!run.ended&&run.x>1990&&run.contacts>0&&Math.abs(run.a)<.7){cleared=true;break;}
   if(saved.last)break;
  }
 }finally{await page.mouse.up();}
 expect(cleared).toBe(true);await expect(page.locator('.cg-crash-card')).toHaveCount(0);
 await expect.poll(async()=>Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''))).toBeGreaterThan(158);
 await info.attach(`starter-past-second-ramp-route-${track}`,{body:await page.screenshot(),contentType:'image/png'});
 await page.locator('.cg-return').click();
 const garage=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage;},key);
 expect(garage.bolts).toBeGreaterThan(0);expect(garage.best[track]).toBeGreaterThan(158);
 expect(garage.owned).toEqual([1,11,26,31,71,81,91]);expect(garage.paidThrough).toBe(1);
});

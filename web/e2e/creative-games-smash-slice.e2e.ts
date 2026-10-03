import {expect,test} from '@playwright/test';
const key='nicos-world-local-save-v4';
test('minimal real-route smash → ramps → warning → brake dodge → one bank → reload',async({page},info)=>{
 await page.clock.install();await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);p.language=language;p.selectedSection='game-arcade';p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,language:info.project.metadata.language});
 await page.reload();await page.getByTestId('open-monster-garage').click();
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+2000));await page.getByTestId('garage-drive').click();
 const pedal=await page.locator('[data-control="gas"]').boundingBox();expect(pedal).not.toBeNull();await page.mouse.move(pedal!.x+pedal!.width/2,pedal!.y+pedal!.height/2);await page.mouse.down();
 const visual=async(name:string)=>{
  await info.attach(name,{body:await page.screenshot(),contentType:'image/png'});
  if(['webkit-iphone-en','chromium-mobile-en'].includes(info.project.name)){
   console.log('TRUCK_VISUAL '+JSON.stringify({name,project:info.project.name,revision:process.env.GITHUB_SHA,image:(await page.screenshot({type:'jpeg',quality:45})).toString('base64')}));
  }
 };
 let smashed=false,landed=false,warned=false;
 for(let i=0;i<330;i++){
  await page.clock.runFor(75);
  const d=Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''));
  if(!smashed&&d>=24){smashed=true;await visual('intro-crate-impact');}
  // The saved state is sampled every 1.5 s; original ramp geometry/criteria stay fixed.
  if(!landed){const r=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage.resume;},key);if(r&&r.x>1990&&r.contacts>0&&Math.abs(r.a)<.7){landed=true;await visual('ramp-two-grounded');}}
  if(await page.locator('.cg-drive').getAttribute('data-sky-phase')==='warning'){warned=true;expect(d).toBeGreaterThanOrEqual(300);expect(Number(await page.locator('.cg-drive').getAttribute('data-active-seconds'))).toBeGreaterThanOrEqual(20);await visual('committed-sky-warning');break;}
  await expect(page.locator('.cg-crash-card')).toHaveCount(0);
 }
 await page.mouse.up();expect(smashed).toBe(true);expect(landed).toBe(true);expect(warned).toBe(true);
 await page.keyboard.down('ArrowLeft');await page.clock.runFor(3500);await page.keyboard.up('ArrowLeft');
 await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-hits','0');
 await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-dodged','1');
 await page.keyboard.press('Escape');
 const run=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage.resume;},key);
 expect(run.smash.cleared).toEqual([1,2,3,4,5,6,7,8]);expect(run.smash.bolts).toBe(31);
 await page.locator('.cg-return').click();
 const before=Number(await page.getByTestId('garage-bolts').innerText());expect(before).toBeGreaterThanOrEqual(31);
 await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();
 await expect(page.getByTestId('garage-bolts')).toHaveText(String(before));
 const g=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage;},key);
 expect(g.resume).toBeNull();expect(g.paidThrough).toBe(1);expect(g.owned).toEqual([1,11,26,31,71,81,91]);
 await page.getByTestId('garage-drive').click();await page.keyboard.press('Escape');await page.locator('.cg-return').click();
 await expect(page.getByTestId('garage-bolts')).toHaveText(String(before));
});

test('fresh truck link opens the canonical garage, starts, pauses and exits without losing saved vehicles',async({page})=>{
 await page.goto('/?play=monster-garage');await expect(page.getByTestId('garage-drive')).toBeVisible();
 await page.getByTestId('garage-drive').click();await expect(page.locator('.cg-drive')).toBeVisible();
 await page.getByTestId('garage-pause').click();await expect(page.locator('.cg-pause-card')).toBeVisible();
 await page.getByTestId('garage-pause').click();await expect(page.locator('.cg-pause-card')).toHaveCount(0);
 await page.locator('.cg-return').click();await expect(page.getByTestId('garage-drive')).toBeVisible();
 await page.locator('.cg-topbar button').click();await expect(page.getByTestId('open-monster-garage')).toBeVisible();await expect(page.getByTestId('open-rainbow-kingdom')).toBeVisible();
 expect(new URL(page.url()).searchParams.has('play')).toBe(false);
 await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('garage-drive')).toBeVisible();
 const g=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage;},key);
 expect(g.owned).toEqual([1,11,26,31,71,81,91]);expect(g.build.parts).toEqual([1,11,26,31,0,0,0,71,81,91,0,0]);
});

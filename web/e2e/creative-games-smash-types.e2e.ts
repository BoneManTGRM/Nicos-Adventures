import {expect,test} from '@playwright/test';
import {COURSE_SMASH} from '../src/creativeGames/smashObjects';
import {makeDrive,terrainAt,carStats} from '../src/creativeGames/carPhysics';
import {normalizeGames,STARTER_BUILD} from '../src/creativeGames/save';
const key='nicos-world-local-save-v4';
for(const o of COURSE_SMASH.slice(0,6))test('real '+o.kind+' sprite, collider, momentum break and preserved bank',async({page},info)=>{
 await page.clock.install({time:new Date('2026-10-03T12:00:00Z')});await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();await page.waitForFunction(key=>localStorage.getItem(key)!==null,key);
 const g=normalizeGames(null),r=makeDrive(STARTER_BUILD),s=carStats(r.build);Object.assign(r,{x:o.x-150,y:terrainAt(o.x-150)-s.radius-s.clearance-4,vx:100,contacts:2});g.garage.sequence=1;g.garage.resume=r;
 await page.evaluate(({key,g,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);Object.assign(p,{selectedSection:'game-arcade',language,creativeGames:g});p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,g,language:info.project.metadata.language});
 await page.reload();await page.getByTestId('open-monster-garage').click();await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+5000));
 await page.locator('.cg-resume').getByRole('button',{name:info.project.metadata.language==='es-MX'?'Continuar recorrido':'Resume drive',exact:true}).click();await page.clock.runFor(100);
 await info.attach(o.kind+'-collider',{body:await page.screenshot(),contentType:'image/png'});
 if(info.project.name==='chromium-mobile-en')console.log('TRUCK_VISUAL '+JSON.stringify({name:o.kind+'-collider',project:info.project.name,revision:process.env.GITHUB_SHA,image:(await page.screenshot({type:'jpeg',quality:45})).toString('base64')}));
 await page.keyboard.down('ArrowRight');let cleared=false;
 for(let i=0;i<40;i++){await page.clock.runFor(75);const ids=(await page.locator('.cg-drive').getAttribute('data-smash-ids'))!.split(',').map(Number);if(ids.includes(o.id)){cleared=true;break;}}
 await page.keyboard.up('ArrowRight');expect(cleared,o.kind).toBe(true);expect(Number(await page.locator('.cg-drive').getAttribute('data-smash-bolts'))).toBe(o.reward);
 await info.attach(o.kind+'-impact',{body:await page.screenshot(),contentType:'image/png'});
 await page.getByTestId('garage-pause').click();const saved=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage.resume;},key);
 expect(saved.smash.cleared).toEqual([o.id]);expect(saved.smash.bolts).toBe(o.reward);expect(saved.ended).toBe(false);
 await page.locator('.cg-return').click();const amount=await page.getByTestId('garage-bolts').innerText();expect(Number(amount)).toBeGreaterThanOrEqual(o.reward);
 await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('garage-bolts')).toHaveText(amount);
});

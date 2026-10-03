import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {normalizeGames,STARTER_BUILD,type Drive} from '../src/creativeGames/save';
import {makeDrive,terrainAt,carStats} from '../src/creativeGames/carPhysics';
const key='nicos-world-local-save-v4';
const isEs=(info:TestInfo)=>info.project.metadata.language==='es-MX';
async function garage(page:Page,info:TestInfo,run?:Drive){
 await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 const games=normalizeGames(null);if(run){games.garage.sequence=run.id;games.garage.resume=run;}
 await page.evaluate(({key,games,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);Object.assign(p,{selectedSection:'game-arcade',language,creativeGames:games});p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,games,language:isEs(info)?'es-MX':'en'});
 await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('garage-drive')).toBeVisible();
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+5000));
 if(run)await page.locator('.cg-resume').getByRole('button',{name:isEs(info)?'Continuar recorrido':'Resume drive',exact:true}).click();else await page.getByTestId('garage-drive').click();
 await page.clock.runFor(150);
}
async function saved(page:Page){return page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.garage;},key);}
async function capture(page:Page,info:TestInfo,name:string){await info.attach(name,{body:await page.screenshot(),contentType:'image/png'});}
function dropFixture(){
 // Keep the stationary collision fixture on clear, level ground. The expanded
 // course now places a crate at the former x=4450 fixture. Stationary-hit and
 // fixed-target assertions stay unchanged; migration clearing is tested separately.
 const x=5600,r=makeDrive(STARTER_BUILD),s=carStats(r.build);
 expect(terrainAt(x-s.width-s.radius)).toBe(330);expect(terrainAt(x+s.width+s.radius)).toBe(330);
 Object.assign(r,{x,y:280,distance:(x-90)/12,contacts:2,vx:0});r.sky!.nextDistance=10000;r.sky!.spawnCount=1;
 r.sky!.active={id:1,kind:0,phase:'warning',x,y:-20,vy:80,radius:22,age:0,hit:false};return r;
}
async function controlsFit(page:Page){const boxes=await page.locator('.cg-controls button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {bottom:r.bottom,top:r.top,height:window.innerHeight,hit:n===hit||n.contains(hit)};}));for(const b of boxes){expect(b.top).toBeGreaterThanOrEqual(0);expect(b.bottom).toBeLessThanOrEqual(b.height);expect(b.hit).toBe(true);}}


import {planSkyAttack} from '../src/creativeGames/skyObjects';
import {COURSE_SMASH} from '../src/creativeGames/smashObjects';
function attack(kind:0|1|2|3){
 const r=makeDrive(STARTER_BUILD,1,0,false,1001);Object.assign(r,{x:5600,y:286,vx:100,t:30,distance:459,contacts:2});
 r.smash!.cleared=COURSE_SMASH.filter(o=>o.x<5700).map(o=>o.id);r.smash!.paid=[...r.smash!.cleared];
 r.sky!.active=planSkyAttack(r,{width:64,comX:0,comY:0,wheels:[],ground:()=>330,speed:372.6},kind,1);
 r.sky!.nextDistance=10000;r.sky!.spawnCount=1;return r;
}
async function visual(page:Page,info:TestInfo,name:string){await capture(page,info,name);if(['chromium-mobile-en','webkit-iphone-en'].includes(info.project.name))console.log('TRUCK_VISUAL '+JSON.stringify({name,project:info.project.name,revision:process.env.GITHUB_SHA,image:(await page.screenshot({type:'jpeg',quality:50})).toString('base64')}));}
for(const kind of [0,1,2,3] as const)test('visible locked pattern '+kind+' has a reachable brake escape without boost/shield',async({page},info)=>{
 const r=attack(kind);r.boostCharge=0;await garage(page,info,r);await expect(page.getByTestId('sky-warning')).toBeVisible();
 const target=await page.locator('.cg-drive').getAttribute('data-sky-target');await controlsFit(page);await visual(page,info,'pattern-'+kind+'-warning');
 await page.clock.runFor(200);await page.keyboard.down('ArrowLeft');await page.clock.runFor(400);await page.keyboard.up('ArrowLeft');
 await page.clock.runFor(1200);await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-target',target!);await visual(page,info,'pattern-'+kind+'-approaching');
 await page.clock.runFor(2000);await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-hits','0');await expect(page.locator('.cg-drive')).toHaveAttribute('data-health','100');
 await page.getByTestId('garage-pause').click();expect((await saved(page)).resume.sky.dodged).toBe(1);
});
test('close diagonal dodge earns once, mute persists and pause → recovery clears hazards with protection',async({page},info)=>{
 const r=attack(2);await garage(page,info,r);await page.getByTestId('garage-mute').click();await expect(page.getByTestId('garage-mute')).toHaveAttribute('aria-pressed','true');
 await page.clock.runFor(350);await page.keyboard.down('ArrowLeft');await page.clock.runFor(150);await page.keyboard.up('ArrowLeft');await page.clock.runFor(1700);await visual(page,info,'diagonal-dodge');
 await page.clock.runFor(1200);await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-hits','0');await page.getByTestId('garage-pause').click();const before=(await saved(page)).resume;expect(before.survival.nearMisses).toEqual([1]);expect(before.survival.reward).toBe(2);await page.clock.runFor(3000);expect((await saved(page)).resume).toEqual(before);
 await page.getByTestId('garage-recover').click();await page.clock.runFor(150);await expect(page.locator('.cg-drive')).toHaveAttribute('data-health','100');await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-phase','none');
 await page.getByTestId('garage-pause').click();const next=(await saved(page)).resume;expect(next.survival.protectedUntil-next.t).toBeGreaterThan(2.5);expect(next.sky.active).toBeNull();
 await page.locator('.cg-return').click();const paid=await saved(page);await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();const restored=await saved(page);expect(restored.muted).toBe(true);expect(restored.bolts).toBe(paid.bolts);expect(restored.owned).toEqual(paid.owned);
});
test('shield consumes once on impact and repair is collected once',async({page},info)=>{
 const r=dropFixture();r.t=30;r.survival!.shield=true;await garage(page,info,r);await page.clock.runFor(3000);await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-hits','1');await expect(page.locator('.cg-drive')).toHaveAttribute('data-health','100');
 await page.getByTestId('garage-pause').click();const after=(await saved(page)).resume;expect(after.survival.shield).toBe(false);expect(after.broken).toEqual([]);
});
test('starter boosted jump produces a clean real landing and capped stunt reward',async({page},info)=>{
 await garage(page,info);await page.keyboard.down('ArrowRight');let boosted=false,landed=false,airCaptured=false;
 for(let i=0;i<220;i++){await page.clock.runFor(50);const d=Number(await page.locator('.cg-drive').getAttribute('data-active-seconds'));const r=(await saved(page)).resume;
  if(!boosted&&r?.x>420&&r.x<760){await page.keyboard.down('ShiftLeft');boosted=true;}
  if(boosted&&r?.x>880)await page.keyboard.up('ShiftLeft');
  if(boosted&&!airCaptured&&r?.air>.2){airCaptured=true;await visual(page,info,'boosted-jump-airborne');}
  if(r?.survival.stunts.length){landed=true;await visual(page,info,'boosted-clean-landing');break;}expect(d).toBeLessThan(15);
 }
 await page.keyboard.up('ShiftLeft');await page.keyboard.up('ArrowRight');expect(boosted).toBe(true);expect(landed).toBe(true);await page.getByTestId('garage-pause').click();const r=(await saved(page)).resume;expect(r.broken.some((id:number)=>id<3)).toBe(false);expect(r.survival.stunts).toContain(1);expect(r.survival.reward).toBeGreaterThanOrEqual(5);
});

test('the visible new run and initial saved run share the same recorded seed',async({page},info)=>{
 await garage(page,info);const visible=Number(await page.locator('.cg-drive').getAttribute('data-run-seed'));const g=await saved(page);expect(g.resume.sky.seed).toBe(visible);
 await page.getByTestId('garage-pause').click();const before=(await saved(page)).resume;await page.clock.runFor(3000);expect((await saved(page)).resume).toEqual(before);
});
test('storage failure leaves the previous good save intact, shows recovery guidance and does not crash',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await garage(page,info);await page.getByTestId('garage-pause').click();const good=await page.evaluate(key=>localStorage.getItem(key),key);
 await page.evaluate(()=>{const set=Storage.prototype.setItem;Object.defineProperty(window,'__restoreTruckStorage',{value:()=>{Storage.prototype.setItem=set;}});Storage.prototype.setItem=function(){throw new DOMException('Isolated quota fixture','QuotaExceededError');};});
 await page.getByTestId('garage-mute').click();await expect(page.locator('.cg-save-error')).toBeVisible();expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(good);expect(errors).toEqual([]);
 await page.evaluate(()=>(window as unknown as {__restoreTruckStorage:()=>void}).__restoreTruckStorage());await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();
 const restored=await saved(page);const original=JSON.parse(good!);const old=original.profiles.find((p:{id:string})=>p.id===original.activeProfileId).creativeGames.garage;expect(restored.bolts).toBe(old.bolts);expect(restored.owned).toEqual(old.owned);expect(restored.blueprints).toEqual(old.blueprints);expect(restored.build).toEqual(old.build);
});

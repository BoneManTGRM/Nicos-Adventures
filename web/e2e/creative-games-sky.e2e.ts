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

test('starter reaches the first natural falling warning only after 300 m AND 20 active seconds',async({page},info)=>{
 await garage(page,info);const pedal=await page.locator('[data-control="gas"]').boundingBox();expect(pedal).not.toBeNull();await page.mouse.move(pedal!.x+pedal!.width/2,pedal!.y+pedal!.height/2);await page.mouse.down();
 let warned=false;for(let i=0;i<180;i++){await page.clock.runFor(150);const distance=Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''));const phase=await page.locator('.cg-drive').getAttribute('data-sky-phase');if(distance<299)expect(phase).toBe('none');if(phase==='warning'){expect(distance).toBeGreaterThanOrEqual(300);warned=true;break;}}
 expect(warned).toBe(true);expect(Number(await page.locator('.cg-drive').getAttribute('data-active-seconds'))).toBeGreaterThanOrEqual(20);await expect(page.getByTestId('sky-warning')).toBeVisible();await controlsFit(page);await capture(page,info,'natural-sky-warning-after-300m');
 // Continue toward the actual drop so the gameplay screenshot includes it,
 // instead of stopping outside the viewport and photographing empty sky.
 const warningDuration=Number(await page.locator('.cg-drive').getAttribute('data-sky-duration'));expect(warningDuration).toBeGreaterThanOrEqual(1.5);await page.clock.runFor(Math.ceil(warningDuration*1000));await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-phase','falling');await page.clock.runFor(300);await capture(page,info,'falling-object-on-track');
 await page.clock.runFor(1500);await page.mouse.up();await page.locator('.cg-return').click();const g=await saved(page);expect(g.bolts).toBeGreaterThan(0);expect(g.owned).toEqual(normalizeGames(null).garage.owned);
});

test('telegraphed direct collision detaches one real part; pause and reload preserve its warning',async({page},info)=>{
 await garage(page,info,dropFixture());await expect(page.getByTestId('sky-warning')).toBeVisible();await page.getByTestId('garage-pause').click();const before=(await saved(page)).resume.sky;
 await page.clock.runFor(3000);expect((await saved(page)).resume.sky).toEqual(before);
 await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.locator('.cg-resume')).toBeVisible();expect((await saved(page)).resume.sky).toEqual(before);
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+5000));await page.locator('.cg-resume').getByRole('button',{name:isEs(info)?'Continuar recorrido':'Resume drive',exact:true}).click();
 await page.clock.runFor(1600);await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-phase','falling');await page.clock.runFor(500);await capture(page,info,'crate-dropping-toward-car');await page.clock.runFor(700);
 await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-hits','1');await capture(page,info,'car-after-one-sky-hit');await page.getByTestId('garage-pause').click();const hit=(await saved(page)).resume;expect(hit.broken).toContain(13);expect(hit.debris.some((d:{id:number})=>d.id===91)).toBe(true);
 await page.locator('.cg-return').click();const paid=await saved(page);expect(paid.owned).toEqual(normalizeGames(null).garage.owned);expect(paid.paidThrough).toBe(1);expect(paid.resume).toBeNull();
});

test('accelerating away from the warned target dodges a real drop without damage',async({page},info)=>{
 await garage(page,info,dropFixture());await page.keyboard.down('ArrowRight');await page.clock.runFor(3000);await page.keyboard.up('ArrowRight');await page.clock.runFor(200);
 await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-hits','0');await expect(page.locator('.cg-drive')).toHaveAttribute('data-sky-dodged','1');await page.getByTestId('garage-pause').click();const r=(await saved(page)).resume;expect(r.broken).toEqual([]);expect(r.sky.spawnCount).toBe(1);
});

test('warning and gas/turbo/brake controls fit portrait and landscape, including reduced motion',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await garage(page,info,dropFixture());
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.clock.runFor(100);await expect(page.getByTestId('sky-warning')).toBeVisible();await controlsFit(page);
  const geometry=await page.getByTestId('sky-warning').evaluate(el=>{const a=el.getBoundingClientRect(),p=el.closest('.cg-track-wrap')!.getBoundingClientRect();return {a:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},p:{top:p.top,bottom:p.bottom,left:p.left,right:p.right}};});expect(geometry.a.top).toBeGreaterThanOrEqual(geometry.p.top);expect(geometry.a.bottom).toBeLessThanOrEqual(geometry.p.bottom);expect(geometry.a.left).toBeGreaterThanOrEqual(geometry.p.left);expect(geometry.a.right).toBeLessThanOrEqual(geometry.p.right);await capture(page,info,`sky-controls-${viewport.width}`);
 }
});

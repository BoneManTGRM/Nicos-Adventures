import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import type {LocalProfile} from '../src/types';
import {normalizeGames,STARTER_BUILD} from '../src/creativeGames/save';
import {makeDrive} from '../src/creativeGames/carPhysics';
import {STARTER_COURSE} from '../src/creativeGames/kingdomPhysics';
const key='nicos-world-local-save-v4';
const es=(info:TestInfo)=>info.project.metadata.language==='es-MX';
const active=(page:Page):Promise<LocalProfile>=>page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);},key);
async function boot(page:Page,info:TestInfo,patch:Partial<LocalProfile>={},origin='/'){
 await page.goto(origin);await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language,patch})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);Object.assign(p,{selectedSection:'game-arcade',language,...patch});p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,language:es(info)?'es-MX':'en',patch});
 await page.reload();await expect(page.getByTestId('open-monster-garage')).toBeVisible();
}
async function fit(page:Page,selector:string){const overflow=await page.locator(selector).evaluate(el=>({page:document.documentElement.scrollWidth-window.innerWidth,element:el.scrollWidth-el.clientWidth}));expect(overflow.page).toBeLessThanOrEqual(2);expect(overflow.element).toBeLessThanOrEqual(2);}
async function picture(page:Page,info:TestInfo,name:string,selector:string){await info.attach(name,{body:await page.locator(selector).screenshot(),contentType:'image/png'});}
async function fixedClock(page:Page){await page.clock.install({time:new Date('2026-09-28T12:00:00Z')});}
async function stopClock(page:Page){await page.clock.pauseAt(new Date('2026-09-28T12:05:00Z'));}

/** Each offline test owns a real origin which can be stopped without disturbing parallel tests.
 * WebKit setOffline kills even literal service-worker responses: playwright#42775.
 * Stopping the origin tests actual cache fallback instead of skipping WebKit coverage.
 */
async function offlineOrigin(){
 const root=resolve('dist'),types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.ico':'image/x-icon'};
 const server=createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url??'/','http://127.0.0.1').pathname);
   let file=resolve(root,`.${pathname}`);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
   try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{if(!extname(pathname))file=resolve(root,'index.html');}
   const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-store','Service-Worker-Allowed':'/'});res.end(body);
  }catch{res.writeHead(404).end();}
 });
 await new Promise<void>((done,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>done());});
 const address=server.address();if(!address||typeof address==='string')throw new Error('Expected isolated HTTP port');
 const origin=`http://127.0.0.1:${address.port}`;let closed=false;
 const stop=async()=>{if(closed)return;closed=true;await new Promise<void>((done,reject)=>{server.close(error=>error?reject(error):done());server.closeAllConnections();});};
 return {origin,stop};
}

test('both illustrated games are reachable without removing the existing arcade',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,info);
 await expect(page.getByTestId('open-rainbow-kingdom')).toBeVisible();await expect(page.getByTestId('open-monster-rift')).toBeVisible();
 await fit(page,'.cg-entries');await picture(page,info,'arcade-entries','.cg-entries');
 await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('monster-garage')).toBeVisible();
 await fit(page,'.cg-shell');await picture(page,info,'garage-workbench','.cg-workbench');
 await page.locator('.cg-topbar').getByRole('button').click();await page.getByTestId('open-rainbow-kingdom').click();
 await expect(page.getByTestId('rainbow-kingdom')).toBeVisible();await fit(page,'.cg-shell');await picture(page,info,'rainbow-garden','.cg-kingdom-stage');expect(errors).toEqual([]);
});

test('real driving supports pause, resume after reload, and exactly one earned payout',async({page},info)=>{
 await fixedClock(page);await boot(page,info);await page.getByTestId('open-monster-garage').click();await stopClock(page);
 await page.getByTestId('garage-drive').click();await page.keyboard.down('ArrowRight');await page.clock.runFor(5000);await page.keyboard.up('ArrowRight');await page.clock.runFor(200);
 const distance=Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''));expect(distance).toBeGreaterThan(8);
 await page.getByTestId('garage-pause').click();const paused=await page.getByTestId('garage-distance').innerText();await page.clock.runFor(2000);await expect(page.getByTestId('garage-distance')).toHaveText(paused);
 await picture(page,info,'driving-ramp-and-touch-controls','.cg-drive');const saved=(await active(page)).creativeGames!.garage;expect(saved.resume!.distance).toBeGreaterThan(8);expect(saved.bolts).toBe(0);
 // Reload must run the app's ordinary timers, including lazy-route scheduling.
 // A globally paused test clock otherwise strands React in its loading fallback.
 await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.locator('.cg-resume')).toBeVisible();
 // The previous 100 ms deadline could pass during WebKit's protocol round trip.
 // Advance the test clock safely while still in the garage; do not change game timeouts or assertions.
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+60_000));
 await page.locator('.cg-resume').getByRole('button',{name:es(info)?'Continuar recorrido':'Resume drive',exact:true}).click();await page.clock.runFor(200);
 await page.locator('.cg-return').click();await expect(page.locator('.cg-receipt')).toBeVisible();const paid=(await active(page)).creativeGames!.garage;expect(paid.bolts).toBeGreaterThan(0);expect(paid.paidThrough).toBe(1);expect(paid.resume).toBeNull();expect(paid.owned).toEqual(saved.owned);
 await page.clock.resume();await page.reload();await page.getByTestId('open-monster-garage').click();expect((await active(page)).creativeGames!.garage.bolts).toBe(paid.bolts);
});

test('a hard landing breaks the equipped build and never charges for rebuilding',async({page},info)=>{
 const games=normalizeGames(null),r=makeDrive(STARTER_BUILD,1);Object.assign(r,{x:600,y:-180,vy:1100,air:1,distance:42});games.garage.sequence=1;games.garage.resume=r;
 await fixedClock(page);await boot(page,info,{creativeGames:games});await page.getByTestId('open-monster-garage').click();await stopClock(page);
 await page.locator('.cg-resume').getByRole('button',{name:es(info)?'Continuar recorrido':'Resume drive',exact:true}).click();await page.clock.runFor(2500);
 await expect(page.locator('.cg-crash-card')).toBeVisible();await expect(page.locator('.cg-drive .cg-help')).toContainText(/detached pieces|piezas desprendidas/);await picture(page,info,'actual-equipped-parts-crash','.cg-drive');
 const paid=(await active(page)).creativeGames!.garage;expect(paid.last!.distance).toBeLessThan(47);expect(paid.owned).toEqual(games.garage.owned);const bolts=paid.bolts;
 await page.locator('.cg-crash-card').getByRole('button',{name:es(info)?'Reconstruir gratis':'Rebuild for free'}).click();expect((await active(page)).creativeGames!.garage.bolts).toBe(bolts);await expect(page.getByTestId('garage-drive')).toBeVisible();
});

test('100 catalog parts, chosen purchases, saved blueprints, and profile isolation',async({page},info)=>{
 const games=normalizeGames(null);games.garage.bolts=100;await boot(page,info,{creativeGames:games});await page.getByTestId('open-monster-garage').click();
 const ids:number[]=[];for(let group=0;group<10;group++){await page.locator('.cg-categories button').nth(group).click();ids.push(...await page.locator('[data-part-id]').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('data-part-id')))));}expect(new Set(ids).size).toBe(100);
 await page.locator('.cg-categories button').nth(1).click();await page.locator('[data-part-id="12"]').click();await page.getByTestId('buy-garage-part').click();await expect(page.getByTestId('garage-bolts')).toHaveText('50');
 await page.locator('.cg-part-detail').getByRole('button',{name:es(info)?'Instalar pieza':'Fit this part'}).click();await page.locator('.cg-build-panel input').first().fill('Lava Jumper');
 await page.locator('.cg-build-panel').getByRole('button',{name:es(info)?'Guardar diseño':'Save blueprint'}).click();const first=await active(page);expect(first.creativeGames!.garage.build.parts[1]).toBe(12);expect(first.creativeGames!.garage.blueprints[0].name).toBe('Lava Jumper');
 await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.locator('.cg-build-panel input').first()).toHaveValue('Lava Jumper');await expect(page.getByTestId('garage-bolts')).toHaveText('50');
 await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);const old=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);s.profiles.push({...old,id:'creative-games-second-child',playerName:'Becca',creativeGames:undefined});s.activeProfileId='creative-games-second-child';localStorage.setItem(key,JSON.stringify(s));},key);
 await page.reload();await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('garage-bolts')).toHaveText('0');expect((await active(page)).creativeGames?.garage.owned.includes(12)??false).toBe(false);
 const original=await page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)!).profiles.find((p:{id:string})=>p.id===id),{key,id:first.id});expect(original.creativeGames.garage.bolts).toBe(50);expect(original.creativeGames.garage.build.name).toBe('Lava Jumper');
});

test('unicorn construction, undo, unlocks, and courses survive reload',async({page},info)=>{
 const games=normalizeGames(null);games.kingdom.petals=50;await boot(page,info,{creativeGames:games});await page.getByTestId('open-rainbow-kingdom').click();
 await page.locator('[data-magic-id="2"]').click();await page.locator('[data-build-pad="0"]').click();expect((await active(page)).creativeGames!.kingdom.layouts[0][0]).toBe(2);
 await page.getByRole('button',{name:es(info)?'Deshacer':'Undo',exact:true}).click();expect((await active(page)).creativeGames!.kingdom.layouts[0][0]).toBe(0);
 await page.getByRole('button',{name:es(info)?'Preparar camino inicial':'Set up starter course',exact:true}).click();
 await page.locator('[data-magic-id="4"]').click();await page.locator('.cg-magic-detail button').click();await expect(page.getByTestId('kingdom-petals')).toHaveText('25');await page.locator('[data-build-pad="1"]').click();
 await page.locator('.cg-kingdom-toolbar input').fill('Moonflower');await page.locator('.cg-kingdom-toolbar select').first().selectOption('1');await fit(page,'.cg-kingdom-toolbar');await picture(page,info,'built-unicorn-adventure','.cg-kingdom-stage');
 await page.reload();await page.getByTestId('open-rainbow-kingdom').click();const saved=(await active(page)).creativeGames!.kingdom;expect(saved).toMatchObject({name:'Moonflower',color:1,petals:25});expect(saved.owned).toContain(4);expect(saved.layouts[0][1]).toBe(4);
});

test('a complete unicorn ride earns real rescues and a replay reward without menu shortcuts',async({page},info)=>{
 const games=normalizeGames(null);games.kingdom.layouts[0]=[...STARTER_COURSE];await fixedClock(page);await boot(page,info,{creativeGames:games});await page.getByTestId('open-rainbow-kingdom').click();await stopClock(page);await page.getByTestId('kingdom-ride').click();await page.clock.runFor(160);
 const stage=page.getByTestId('kingdom-stage');let completed=false;
 for(let tick=0;tick<430;tick++){
  const state=await stage.evaluate(el=>({x:Number(el.getAttribute('data-world-x')),y:Number(el.getAttribute('data-world-y')),grounded:el.getAttribute('data-grounded')==='true',found:Number(el.getAttribute('data-friends'))}));
  if(state.x>1975&&state.found===3){completed=true;break;}
  const target=state.found<3?[694,1244,1784][state.found]:2010;
  if(state.x<target-12){await page.keyboard.down('ArrowRight');await page.keyboard.up('ArrowLeft');}else if(state.x>target+12){await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');}else{await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');}
  if(state.grounded)await page.keyboard.down('Space');else await page.keyboard.up('Space');
  await page.clock.runFor(120);
 }
 await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowLeft');await page.keyboard.up('Space');await page.clock.runFor(200);
 await picture(page,info,'unicorn-real-ride-result','.cg-kingdom-stage');expect(completed).toBe(true);await expect(page.locator('.cg-kingdom-complete')).toBeVisible();
 const paid=(await active(page)).creativeGames!.kingdom;expect(paid.rescued).toEqual([0,1,2]);expect(paid.completed).toContain(0);expect(paid.petals).toBe(90);expect(paid.paidThrough).toBe(1);
 await page.clock.runFor(2000);expect((await active(page)).creativeGames!.kingdom.petals).toBe(90);
});

test('visited games and their profile saves reopen with the actual origin stopped',async({page},info)=>{
 const server=await offlineOrigin();
 try{
  await boot(page,info,{},server.origin);expect(await page.evaluate(()=> 'serviceWorker' in navigator)).toBe(true);
  await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('monster-garage')).toBeVisible();await page.locator('.cg-build-panel input').first().fill('Offline Buggy');
  await page.locator('.cg-topbar').getByRole('button').click();await page.getByTestId('open-rainbow-kingdom').click();await expect(page.getByTestId('rainbow-kingdom')).toBeVisible();await page.locator('[data-build-pad="0"]').click();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await server.stop();
  // Independent negative control: no origin can answer an uncached request.
  await expect(fetch(`${server.origin}/uncached-offline-proof`,{signal:AbortSignal.timeout(3000)})).rejects.toThrow();
  const response=await page.reload();expect(response?.fromServiceWorker()).toBe(true);
  await page.getByTestId('open-monster-garage').click();await expect(page.locator('.cg-build-panel input').first()).toHaveValue('Offline Buggy');
  await page.locator('.cg-topbar').getByRole('button').click();await page.getByTestId('open-rainbow-kingdom').click();expect((await active(page)).creativeGames!.kingdom.layouts[0][0]).toBe(1);
 }finally{await server.stop();}
});
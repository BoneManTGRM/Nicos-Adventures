import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { STOPS } from '../src/game/friendsMap/simulation';
import type { StopId } from '../src/game/friendsMap/simulation';
import { roomCamera, ROOM_PARTS } from '../src/game/friendsMap/interiors';
const routes = { garden: [0,0,1,1,2,2], workshop: [0,1,1,1,2,2], treehouse: [2,0,1], castle: [1,0,2,1], observatory: [0,1,2,3,4] };
async function boot(page: Page, info: TestInfo) {
  await page.goto('/'); await page.locator('.fw-brand').click();
  const es=info.project.metadata.language==='es-MX';
  if(es) await page.getByRole('button',{name:'Cambiar a español de México'}).click();
  await page.locator('.fw-destination-grid > .fw-destination').filter({has:page.getByText(es?'Sala de juegos':'Game Arcade',{exact:true})}).click();
  await page.getByTestId('open-friends-map').click(); await expect(page.getByTestId('map-start')).toBeEnabled({timeout:25000}); await page.getByTestId('map-start').click(); return es;
}
async function enter(page: Page, id: StopId) {
  const stop=STOPS.find(s=>s.id===id)!;
  await page.locator('.friends-map__status button').click(); await page.locator(`[data-map-destination="${id}"]`).click();
  const canvas=page.getByTestId('friends-map-canvas');
  await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement,p)=>Math.hypot(Number(c.dataset.x)-p.x,Number(c.dataset.y)-p.y),stop),{timeout:25000}).toBeLessThan(12);
  await expect(canvas).toHaveAttribute('data-path','0');
  const before=await canvas.evaluate((c:HTMLCanvasElement)=>({x:c.dataset.x,y:c.dataset.y}));
  await page.getByTestId('room-enter').click(); await expect(page.locator('.friends-map')).toHaveAttribute('data-map-room',id);
  await expect(canvas).toHaveAttribute('data-room',id); return before;
}
async function supplies(page: Page, es: boolean) {
  const canvas=page.getByTestId('friends-map-canvas');
  for(let i=1;i<=2;i++){await page.getByTestId('room-action').click();await expect(canvas).toHaveAttribute('data-room-found',String(i),{timeout:15000});await expect(canvas).toHaveAttribute('data-room-path','0');}
  await page.getByTestId('room-action').click(); await expect(page.getByTestId('room-action')).toHaveText(es?'Abrir el desafío':'Open challenge',{timeout:15000});
  await expect(canvas).toHaveAttribute('data-room-path','0'); await page.getByTestId('room-action').click(); await expect(page.locator('.room-puzzle')).toBeVisible();
}
async function solve(page:Page,id:StopId){for(const n of routes[id])await page.locator(`[data-puzzle-choice="${n}"]`).click();await expect(page.locator('.room-puzzle')).toHaveAttribute('data-puzzle-solved','true');}
async function painted(page:Page) {
  await expect.poll(()=>page.getByTestId('friends-map-canvas').evaluate((c:HTMLCanvasElement)=>{
    const colors=new Set<string>(),context=c.getContext('2d')!;
    for(let y=1;y<12;y++)for(let x=1;x<12;x++){
      const rgba=context.getImageData(Math.floor(c.width*x/12),Math.floor(c.height*y/12),1,1).data;
      colors.add(`${rgba[0]>>4},${rgba[1]>>4},${rgba[2]>>4},${rgba[3]>>4}`);
    }
    return colors.size;
  })).toBeGreaterThan(8);
}
async function shot(page:Page,info:TestInfo,label:string){await painted(page);await info.attach(label,{body:await page.screenshot(),contentType:'image/png'});}

test('five enterable buildings, five different challenges, exact return and saved treasure',async({page},info)=>{
  test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const es=await boot(page,info);
  for(const [i,id] of (['garden','workshop','treehouse','castle','observatory'] as StopId[]).entries()){
    await page.locator(`[data-map-friend="${['nico','becca','lua','boltbot','sparky'][i]}"]`).click();
    const before=await enter(page,id);await shot(page,info,`interior-${id}`);await supplies(page,es);await shot(page,info,`challenge-${id}`);await solve(page,id);
    await expect(page.locator('.friends-map')).toHaveAttribute('data-room-done',String(i+1));
    if(i===4){await page.getByTestId('room-treasure').click();await expect(page.getByTestId('room-treasure')).toBeDisabled();await shot(page,info,'team-treasure');}
    await page.locator('.room-puzzle header>button').click();await page.getByTestId('room-exit').click();
    const canvas=page.getByTestId('friends-map-canvas');await expect(canvas).toHaveAttribute('data-room','island');
    expect(await canvas.evaluate((c:HTMLCanvasElement)=>({x:c.dataset.x,y:c.dataset.y}))).toEqual(before);
  }
  const stars=await page.locator('.fw-profile-pill').nth(1).textContent();
  await page.reload();await page.getByTestId('open-friends-map').click();await expect(page.getByTestId('map-start')).toBeEnabled();
  await expect(page.locator('.friends-map')).toHaveAttribute('data-room-done','5');await expect(page.locator('.friends-map')).toHaveAttribute('data-room-treasure','true');
  expect(await page.locator('.fw-profile-pill').nth(1).textContent()).toBe(stars);
  await page.getByTestId('map-start').click();await enter(page,'garden');const beforeReplay=await page.locator('.fw-profile-pill').nth(1).textContent();await supplies(page,es);await solve(page,'garden');
  expect(await page.locator('.fw-profile-pill').nth(1).textContent()).toBe(beforeReplay);expect(errors).toEqual([]);
});
test('indoor tap movement, low-power idle, pause, modal focus and phone layout',async({page,isMobile},info)=>{
  test.setTimeout(90000);const es=await boot(page,info);await enter(page,'workshop');const canvas=page.getByTestId('friends-map-canvas');
  const geometry=await canvas.evaluate((c:HTMLCanvasElement)=>({width:c.width,height:c.height}));const camera=roomCamera(geometry.width,geometry.height);const rect=(await canvas.boundingBox())!,target=ROOM_PARTS[0];
  const x=rect.x+(target.x-camera.x)*camera.scale/geometry.width*rect.width,y=rect.y+(target.y-camera.y)*camera.scale/geometry.height*rect.height;
  if(isMobile)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
  await expect(canvas).toHaveAttribute('data-room-found','1');await expect(canvas).toHaveAttribute('data-room-path','0');await page.waitForTimeout(700);
  const frame=await canvas.getAttribute('data-frames');await page.waitForTimeout(700);expect(await canvas.getAttribute('data-frames')).toBe(frame);
  await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.getByTestId('map-pause').click();await page.keyboard.up('ArrowRight');
  const paused=await canvas.getAttribute('data-frames');await page.waitForTimeout(400);expect(await canvas.getAttribute('data-frames')).toBe(paused);
  await page.getByTestId('map-start').click();await page.getByTestId('room-action').click();await expect(canvas).toHaveAttribute('data-room-found','2');await expect(canvas).toHaveAttribute('data-room-path','0');
  await page.getByTestId('room-action').click();await expect(page.getByTestId('room-action')).toHaveText(es?'Abrir el desafío':'Open challenge');await expect(canvas).toHaveAttribute('data-room-path','0');await page.getByTestId('room-action').click();
  await expect(page.locator('.room-puzzle')).toBeVisible();await page.waitForTimeout(150);const at=await canvas.getAttribute('data-frames');await page.keyboard.press('ArrowRight');await page.waitForTimeout(350);expect(await canvas.getAttribute('data-frames')).toBe(at);
  await page.keyboard.press('Escape');await expect(page.locator('.room-puzzle')).toHaveCount(0);
  await page.setViewportSize({width:844,height:390});
  await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.width)).toBe(844);
  await shot(page,info,'indoor-landscape');
  await expect(page.getByTestId('room-exit')).toBeVisible();const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(over).toBeLessThanOrEqual(2);
  const metrics=await canvas.evaluate((c:HTMLCanvasElement)=>({...c.dataset,width:c.width,height:c.height}));expect(metrics.width).toBeLessThanOrEqual(1024);expect(metrics.height).toBeLessThanOrEqual(640);
  await info.attach('indoor-performance',{body:Buffer.from(JSON.stringify({...metrics,idleRedraws:0},null,2)),contentType:'application/json'});
  // A paused room must also survive rotation without becoming an empty canvas.
  await page.getByTestId('map-pause').click();await page.setViewportSize({width:390,height:780});
  await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.width)).toBe(390);await painted(page);
  await page.waitForTimeout(100);const rotated=await canvas.getAttribute('data-frames');await page.waitForTimeout(350);expect(await canvas.getAttribute('data-frames')).toBe(rotated);
  await page.getByTestId('room-exit').click();await expect(page.locator('.friends-map')).toHaveAttribute('data-map-room','island');
});
test('rooms remain playable offline and mistakes do not complete a challenge',async({page,context},info)=>{
  test.setTimeout(90000);const es=await boot(page,info);await enter(page,'treehouse');await context.setOffline(true);await supplies(page,es);
  await page.locator('[data-puzzle-choice="0"]').click();await expect(page.locator('.room-puzzle')).toHaveAttribute('data-puzzle-solved','false');await expect(page.locator('.friends-map')).toHaveAttribute('data-room-done','0');
  await solve(page,'treehouse');await context.setOffline(false);await page.locator('.room-puzzle header>button').click();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('.friends-map')).toHaveAttribute('data-map-status','paused');
  await page.getByTestId('room-exit').click();await page.getByTestId('map-start').click();await page.locator('.friends-map__top button').first().click();await expect(page.getByTestId('open-friends-map')).toBeVisible();
});

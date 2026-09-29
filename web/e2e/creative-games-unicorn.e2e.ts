import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {normalizeGames} from '../src/creativeGames/save';
const key='nicos-world-local-save-v4';
test.use({serviceWorkers:'block'});
async function enterArcade(page:Page,info:TestInfo){
 const games=normalizeGames(null);games.kingdom.petals=88;games.garage.bolts=42;
 await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,games,language})=>{const s=JSON.parse(localStorage.getItem(key)!);const p=s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);p.selectedSection='game-arcade';p.language=language;p.creativeGames=games;p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,games,language:info.project.metadata.language});
 await page.reload();await expect(page.getByTestId('open-rainbow-kingdom')).toBeVisible();
}

test('the real site unicorn is painted in the game, portrait and card; poses and palettes work',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 // Observe the actual drawing boundary. This instrumentation does not select
 // poses, alter controls, or substitute artwork in the application.
 await page.addInitScript(()=>{
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args:Parameters<CanvasRenderingContext2D['drawImage']>){
   const image=args[0];
   const source=image instanceof HTMLImageElement?image.currentSrc:image instanceof HTMLCanvasElement?image.dataset.testUnicornSource:'';
   if(source?.includes('unicorn-')&&this.canvas instanceof HTMLCanvasElement)this.canvas.dataset.testUnicornSource=source;
   return Reflect.apply(original,this,args);
  } as CanvasRenderingContext2D['drawImage'];
 });
 await enterArcade(page,info);
 await expect(page.locator('.cg-unicorn-card img')).toHaveAttribute('src',/unicorn-prance-v2/);
 await page.getByTestId('open-rainbow-kingdom').click();await expect(page.getByTestId('kingdom-ride')).toBeVisible();
 const portrait=page.locator('.cg-intro > canvas');await expect(portrait).toHaveAttribute('data-test-unicorn-source',/unicorn-turn-v2/);
 const palettes:string[]=[];
 for(let color=0;color<4;color++){
  await page.locator('.cg-kingdom-toolbar select').first().selectOption(String(color));
  await expect.poll(async()=>page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames.kingdom.color;},key)).toBe(color);
  palettes.push(await portrait.evaluate(el=>(el as HTMLCanvasElement).toDataURL()));
 }
 expect(new Set(palettes).size).toBe(4);
 await page.locator('.cg-kingdom-toolbar select').first().selectOption('0');
 await info.attach('site-unicorn-builder',{body:await page.locator('.cg-kingdom-stage').screenshot(),contentType:'image/png'});
 await page.getByTestId('kingdom-ride').click();const canvas=page.locator('.cg-kingdom-canvas');
 await expect(canvas).toHaveAttribute('data-test-unicorn-source',/unicorn-turn-v2/);
 await page.keyboard.down('ArrowRight');await expect(canvas).toHaveAttribute('data-test-unicorn-source',/unicorn-prance-v2/);
 await page.keyboard.down('Space');await expect(canvas).toHaveAttribute('data-test-unicorn-source',/unicorn-float-v2/);
 await page.keyboard.up('Space');await page.keyboard.up('ArrowRight');
 await info.attach('site-unicorn-active-game',{body:await page.screenshot(),contentType:'image/png'});
 expect(errors).toEqual([]);
 const wallets=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId).creativeGames;},key);
 expect(wallets.kingdom.petals).toBe(88);expect(wallets.garage.bolts).toBe(42);
});

test('failed artwork loading has an explicit retry and does not lose saved progress',async({page},info)=>{
 const pattern='**/unicorn-*-v2*.webp';await page.route(pattern,route=>route.abort());
 await enterArcade(page,info);await page.getByTestId('open-rainbow-kingdom').click();
 await expect(page.locator('.cg-art-loading[role="alert"]')).toBeVisible();await expect(page.getByTestId('kingdom-ride')).toHaveCount(0);
 await page.unroute(pattern);await page.locator('.cg-art-loading button').click();
 await expect(page.getByTestId('kingdom-ride')).toBeVisible();await expect(page.getByTestId('kingdom-petals')).toHaveText('88');
 await page.locator('.cg-topbar button').click();await page.getByTestId('open-monster-garage').click();await expect(page.getByTestId('garage-bolts')).toHaveText('42');
});

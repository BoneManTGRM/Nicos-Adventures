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

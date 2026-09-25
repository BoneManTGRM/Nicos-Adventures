import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { applyStarBridgeEvent } from '../src/game/goldenAdventureProfile';
import type { StarBridgeEvent } from '../src/game/goldenAdventure';
import type { LocalProfile } from '../src/types';
const key='nicos-world-local-save-v4';
const es=(info:TestInfo)=>info.project.metadata.language==='es-MX';
const profile=(page:Page):Promise<LocalProfile>=>page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)!);return s.profiles.find((p:{id:string})=>p.id===s.activeProfileId);},key);
async function boot(page:Page,info:TestInfo){await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();if(es(info))await page.getByRole('button',{name:'Cambiar a español de México'}).click();}
async function menu(page:Page,kind:'create'|'more'){
 const visible=page.locator(`.world-travel [data-journey-nav="${kind}"]`);
 await (await visible.count()?visible:page.locator(`.fw-bottom-nav [data-journey-nav="${kind}"]`)).click();
 await expect(page.getByRole('dialog')).toBeVisible();
}
async function goHome(page:Page){const top=page.locator('.world-travel [data-journey-nav="home"]');await(await top.count()?top:page.locator('.fw-bottom-nav [data-journey-nav="home"]')).click();await expect(page.locator('.living-home')).toBeVisible();}
async function layout(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)).toBe(true);}
const events:StarBridgeEvent['type'][]=['REVEAL_BRIDGE','CONFIGURE_ROBOT','PASS_MOVEMENT_TEST','PASS_SCANNER_TEST','PASS_LOGIC_TEST','INSPECT_BRIDGE','INSTALL_STAR_CORE','COMPLETE_ADVENTURE'];
async function progress(page:Page,count:number){let p=await profile(page);for(const type of events.slice(0,count))p=applyStarBridgeEvent(p,{type});p.selectedSection='robot-home';await page.evaluate(({p,key})=>{const s=JSON.parse(localStorage.getItem(key)!);s.profiles=s.profiles.map((old:{id:string})=>old.id===s.activeProfileId?p:old);localStorage.setItem(key,JSON.stringify(s));},{p,key});await page.reload();await expect(page.locator('.living-home')).toBeVisible();}

test('first screen has three clear choices, labeled navigation and direct mission start',async({page},info)=>{
 await boot(page,info);
 await expect(page.getByTestId('continue-world')).toHaveText(new RegExp(es(info)?'Empezar mi aventura':'Start my adventure'));
 await expect(page.getByTestId('world-create')).toBeVisible();await expect(page.getByTestId('world-explore')).toBeVisible();
 const controls=await page.locator('.fw-bottom-nav [data-journey-nav]').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect(),label=e.querySelector('small')!;return {w:r.width,h:r.height,label:label.textContent,display:getComputedStyle(label).display};}));
 expect(controls).toHaveLength(4);for(const c of controls){expect(c.w).toBeGreaterThanOrEqual(44);expect(c.h).toBeGreaterThanOrEqual(44);expect(c.label?.length).toBeGreaterThan(0);expect(c.display).not.toBe('none');}
 expect(await page.getByTestId('world-create').evaluate(e=>e.getBoundingClientRect().bottom<innerHeight)).toBe(true);
 await layout(page);await info.attach('simplified-first-screen',{body:await page.screenshot(),contentType:'image/png'});
 await page.getByTestId('world-explore').click();await expect(page.locator('#world-atlas-title')).toBeFocused();
 await expect(page.locator('.fw-destination-grid>.fw-destination')).toHaveCount(16);
 await page.locator('.fw-brand').click();await page.getByTestId('continue-world').click();
 await expect(page.locator('.fw-app')).toHaveAttribute('data-active-section','robo-lab');
 expect((await profile(page)).adventures.starBridge.step).toBe('map_revealed');
 await expect(page.getByRole('button',{name:new RegExp(es(info)?'Continuar a la cámara':'Continue to the test chamber')})).toBeVisible();
});

test('Create and More use accessible dialogs without disturbing a draft',async({page},info)=>{
 await boot(page,info);const opener=page.getByTestId('world-create');await opener.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 for(let i=0;i<10;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(d=>d.contains(document.activeElement))).toBe(true);}
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();
 await menu(page,'create');await page.locator('[data-menu-destination="art-studio"]').click();
 const title=page.getByLabel(es(info)?'Título':'Title',{exact:true});await title.fill('My unfinished picture');
 await menu(page,'more');await info.attach('more-menu',{body:await page.screenshot(),contentType:'image/png'});
 await page.getByRole('button',{name:es(info)?'Cerrar menú':'Close menu',exact:true}).click();await expect(title).toHaveValue('My unfinished picture');
 await menu(page,'more');await page.locator('[data-menu-destination="parent-settings"]').click();await expect(page.locator('.fw-app')).toHaveAttribute('data-active-section','parent-settings');
 await layout(page);
});

test('saved artwork goes home and opens the exact editable creation without extra rewards',async({page},info)=>{
 await boot(page,info);await page.getByTestId('world-create').click();await page.locator('[data-menu-destination="art-studio"]').click();
 const title=page.getByLabel(es(info)?'Título':'Title',{exact:true});await title.fill('Our connected world');
 await page.getByRole('button',{name:es(info)?'Herramientas':'Tools',exact:true}).click();await expect(page.locator('#art-tools')).toBeFocused();
 await page.getByLabel(es(info)?'Mensaje':'Caption',{exact:true}).fill('A drawing we will keep');
 await page.getByRole('button',{name:/Save artwork$|Guardar obra$/}).click();await expect(page.getByTestId('art-see-home')).toBeVisible();
 const saved=await profile(page),id=saved.displayedArtworkId;expect(saved.artwork).toHaveLength(1);
 await page.getByTestId('art-see-home').click();await expect(page.locator(`.living-home__art [data-artwork-id="${id}"]`)).toBeVisible();
 await page.reload();await expect(page.getByTestId('home-edit-art')).toContainText('Our connected world');
 await info.attach('creations-at-home',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
 await page.getByTestId('home-edit-art').click();await expect(title).toHaveValue('Our connected world');
 await expect(page.getByLabel(es(info)?'Mensaje':'Caption',{exact:true})).toHaveValue('A drawing we will keep');
 await page.getByRole('button',{name:/Update$|Actualizar$/}).click();const reopened=await profile(page);
 expect(reopened.artwork).toHaveLength(1);expect(reopened.stars).toBe(saved.stars);
 await layout(page);await info.attach('mobile-art-studio',{body:await page.screenshot(),contentType:'image/png'});
});

test('saved story returns home and reopens identical pages and choices',async({page},info)=>{
 await boot(page,info);await menu(page,'create');await page.locator('[data-menu-destination="story-castle"]').click();
 await page.getByLabel(es(info)?'Título':'Title',{exact:true}).fill('The story we brought home');
 await page.getByRole('button',{name:es(info)?'Guardar cuento':'Save story',exact:true}).click();
 await expect(page.getByTestId('story-see-home')).toBeVisible();const saved=await profile(page);
 await page.getByTestId('story-see-home').click();await page.reload();await expect(page.getByTestId('home-read-story')).toContainText('The story we brought home');
 await page.getByTestId('home-read-story').click();await expect(page.locator('#story-preview-heading')).toHaveText('The story we brought home');
 expect((await profile(page)).stories).toEqual(saved.stories);expect((await profile(page)).stars).toBe(saved.stars);
 await page.getByRole('button',{name:es(info)?'Actualizar cuento':'Update story',exact:true}).click();
 expect((await profile(page)).stars).toBe(saved.stars);expect((await profile(page)).stories).toEqual(saved.stories);
 await layout(page);
});

test('home empty states reach the right workshops and every destination remains accessible',async({page},info)=>{
 await boot(page,info);await goHome(page);await expect(page.getByText(/Build a two-robot team|Forma un equipo de dos robots/)).toHaveCount(0);
 await page.getByTestId('home-create-pet').click();await expect(page.locator('.fw-app')).toHaveAttribute('data-active-section','pet-workshop');
 await goHome(page);await page.getByTestId('home-create-art').click();await expect(page.locator('.fw-app')).toHaveAttribute('data-active-section','art-studio');
 await page.locator('.fw-brand').click();await expect(page.locator('.fw-destination-grid>.fw-destination')).toHaveCount(16);
 await expect(page.locator('.fw-destination-grid>.is-locked')).toHaveCount(1);
});

test('resume opens the actual repair stage and completed missions stay completed',async({page},info)=>{
 await boot(page,info);await progress(page,5);const before=await profile(page);
 await page.locator('.robot-home-system>.world-continue button').click();await expect(page.locator('.broken-bridge')).toBeVisible();
 expect((await profile(page)).adventures.starBridge).toEqual(before.adventures.starBridge);expect((await profile(page)).stars).toBe(before.stars);
 await goHome(page);await progress(page,8);const complete=await profile(page);
 await page.locator('.fw-brand').click();await page.getByTestId('continue-world').click();await expect(page.locator('.living-home')).toBeVisible();
 expect((await profile(page)).adventures.starBridge).toEqual(complete.adventures.starBridge);expect((await profile(page)).stars).toBe(complete.stars);
});

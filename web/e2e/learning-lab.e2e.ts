import { expect,test,type Page } from '@playwright/test';
const key='nicos-world-local-save-v4';
async function boot(page:Page,language:'en'|'es-MX'){
 await page.goto('/');await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language})=>{const store=JSON.parse(localStorage.getItem(key)!);const p=store.profiles[0];p.playerName='Synthetic learner';p.language=language;p.selectedSection='learning-lab';localStorage.setItem(key,JSON.stringify(store));},{key,language});
 await page.reload();await expect(page.getByTestId('learning-lab')).toBeVisible();
}
test('lesson hint, checked answer, locale, reload and phone geometry',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 const lab=page.getByTestId('learning-lab');await lab.getByRole('button',{name:es?'Me toca':'My turn',exact:true}).click();
 await lab.getByRole('button',{name:/Give me a hint|Dame una pista/}).click();
 const before=await lab.getAttribute('data-item-id');
 await lab.getByLabel(es?'Idioma':'Language',{exact:true}).selectOption(es?'en':'es-MX');
 await expect(lab).toHaveAttribute('data-item-id',before!);
 await page.reload();await expect(lab).toHaveAttribute('data-item-id',before!);await expect(lab.locator('.learning-hint')).toBeVisible();
 await lab.locator('[data-answer-id="3"]').click();
 await expect(lab.locator('.learning-feedback')).toBeVisible();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].learningLab,key);
 expect(saved.results[before!].assisted).toBe(true);
 const geometry=await lab.evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth+2,small:[...el.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44;}).length}));
 expect(geometry).toEqual({overflow:false,small:0});
 await info.attach('learning-lab-synthetic',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('remote-only voices stay in text mode with no new outbound calls',async({page},info)=>{
 await page.addInitScript(()=>{
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{voiceURI:'remote',name:'Remote',lang:'es-MX',localService:false}],addEventListener:()=>{},removeEventListener:()=>{},cancel:()=>{},speak:()=>{throw new Error('Remote voice must never be used');}}});
 });
 await boot(page,info.project.metadata.language==='es-MX'?'es-MX':'en');
 const calls:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))calls.push(r.url());});
 const lab=page.getByTestId('learning-lab');await expect(lab.getByRole('button',{name:/^Repeat$|^Repetir$/})).toBeDisabled();
 await lab.getByRole('button',{name:/^My turn$|^Me toca$/}).click();
 await lab.getByRole('button',{name:/Give me a hint|Dame una pista/}).click();
 expect(calls).toEqual([]);
});
test('cached lesson survives offline reload',async({page,context},info)=>{
 await boot(page,info.project.metadata.language==='es-MX'?'es-MX':'en');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();await expect(page.getByTestId('learning-lab')).toBeVisible();
 await context.setOffline(true);await page.reload();await expect(page.getByTestId('learning-lab')).toBeVisible();
 await page.getByRole('button',{name:/^My turn$|^Me toca$/}).click();await expect(page.locator('.learning-answers')).toBeVisible();
});

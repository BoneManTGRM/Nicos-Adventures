import { ownedOrigin } from './ownedOrigin';
import { expect,test,type Page } from '@playwright/test';
const key='nicos-world-local-save-v4';
async function boot(page:Page,language:'en'|'es-MX',origin='/'){
 await page.goto(origin);await expect(page.getByTestId('continue-world')).toBeVisible();
 await page.evaluate(({key,language})=>{const store=JSON.parse(localStorage.getItem(key)!);const p=store.profiles[0];p.playerName='Synthetic learner';p.language=language;p.selectedSection='learning-lab';localStorage.setItem(key,JSON.stringify(store));},{key,language});
 await page.reload();await expect(page.getByTestId('learning-lab')).toBeVisible();
 await page.getByRole('button',{name:/Robot Rescue · numbers|Rescate Robot · números/}).click();
}

test('lesson hint, checked answer, locale, reload and phone geometry',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 const lab=page.getByTestId('learning-lab');await lab.getByRole('button',{name:es?'Me toca':'My turn',exact:true}).click();
 await lab.getByRole('button',{name:/Give me a hint|Dame una pista/}).click();
 const before=await lab.getAttribute('data-item-id');
 await lab.getByLabel(es?'Idioma':'Language',{exact:true}).selectOption(es?'en':'es-MX');
 await expect(lab).toHaveAttribute('data-item-id',before!);
 await page.reload();await page.getByRole('button',{name:/Robot Rescue · numbers|Rescate Robot · números/}).click();await expect(lab).toHaveAttribute('data-item-id',before!);await expect(lab.locator('.learning-hint')).toBeVisible();
 await lab.locator('[data-answer-id="3"]').click();
 await expect(lab.locator('.learning-feedback')).toBeVisible();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].learningLab,key);
 expect(saved.results[before!].assisted).toBe(true);
 const geometry=await lab.evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth+2,small:[...el.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<44||r.height<44);}).length}));
 expect(geometry).toEqual({overflow:false,small:0});
 await info.attach('learning-lab-synthetic',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('text lessons have no voice controls or new outbound calls',async({page},info)=>{
 await page.addInitScript(()=>{
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{voiceURI:'remote',name:'Remote',lang:'es-MX',localService:false}],addEventListener:()=>{},removeEventListener:()=>{},cancel:()=>{},speak:()=>{throw new Error('Remote voice must never be used');}}});
 });
 await boot(page,info.project.metadata.language==='es-MX'?'es-MX':'en');
 const calls:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))calls.push(r.url());});
 const lab=page.getByTestId('learning-lab');await expect(lab.getByRole('button',{name:/^Repeat$|^Repetir$/})).toHaveCount(0);
 await lab.getByRole('button',{name:/^My turn$|^Me toca$/}).click();
 await lab.getByRole('button',{name:/Give me a hint|Dame una pista/}).click();
 expect(calls).toEqual([]);
});
test('cached lesson survives Chromium offline or WebKit origin outage',async({page,context,browser,browserName},info)=>{
 const upstream=info.project.use.baseURL;
 if(!upstream)throw new Error('Preview origin required');
 // Same independently controlled outage fixture as the existing pet regression.
 // Pinned WebKit setOffline rejects SW navigation (Playwright #42775).
 const mirror=browserName==='webkit'?await ownedOrigin(upstream):null;
 const origin=mirror?.url??upstream;
 try {
  await boot(page,info.project.metadata.language==='es-MX'?'es-MX':'en',origin);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.reload();await expect(page.getByTestId('learning-lab')).toBeVisible();
  if(mirror){
   await mirror.stop();expect(mirror.listening()).toBe(false);
   const negative=await browser.newContext({serviceWorkers:'block'});
   try{const control=await negative.newPage();expect(await control.goto(origin,{timeout:10000}).then(()=>false,()=>true)).toBe(true);}finally{await negative.close();}
   info.annotations.push({type:'qualification-scope',description:'Real origin outage, not OS offline or physical iPhone certification.'});
  }else await context.setOffline(true);
  const restored=await page.reload({waitUntil:'domcontentloaded'});
  expect(restored?.status()).toBe(200);expect(restored?.fromServiceWorker()).toBe(true);
  await expect(page.getByTestId('learning-lab')).toBeVisible();
  await page.getByRole('button',{name:/Robot Rescue · numbers|Rescate Robot · números/}).click();await page.getByRole('button',{name:/^My turn$|^Me toca$/}).click();await expect(page.locator('.learning-answers')).toBeVisible();
 }finally{await mirror?.stop();}
});
test('word lessons work without speech APIs or voice settings',async({page},info)=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:undefined});});
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 await page.getByRole('button',{name:/Word rescue · English|Rescate de palabras · inglés/}).click();
 const lab=page.getByTestId('learning-lab');
 await expect(lab.getByRole('button',{name:/^(Listen|Escuchar|Stop|Detener|Preview voice)$/})).toHaveCount(0);
 await expect(lab.locator('summary').filter({hasText:/Voice|Voz/})).toHaveCount(0);
 await lab.getByRole('button',{name:es?'Buscar la imagen':'Find the picture',exact:true}).click();
 await lab.locator('[data-word-answer="robot"]').click();
 await expect(lab.locator('.learning-feedback')).toContainText(es?'¡Lo encontraste!':'You found it!');
});

test('all six missions in both bands teach, retry, check and reward once',async({page},info)=>{
 test.setTimeout(240000);
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 const lab=page.getByTestId('learning-lab');
 const initialStars=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].stars,key);
 // Literal independently reviewed answers, not values read from the lesson generator.
 const answers=[
  [['3','left','5','right'],['12','right','15','left']],
  [['5','3','7','4'],['15','9','17','8']],
  [['blue','circle','red','triangle'],['15','18','21','20']],
  [['abc','bac','cab','acb'],['abcd','bcad','cadb','bdac']],
  [['2','1','3','2'],['3','4','2','1']],
  [['6','3','8','5'],['19','8','23','12']],
 ];
 for(let band=0;band<2;band++){
  if(band)await lab.getByRole('button',{name:es?'Más difícil':'Make it harder',exact:true}).click();
  for(let mission=0;mission<6;mission++){
   await lab.locator('.learning-missions button').nth(mission).click();
   await expect(lab.locator('.learning-example')).toBeVisible();
   await lab.getByRole('button',{name:es?'Me toca':'My turn',exact:true}).click();
   for(let position=0;position<4;position++){
    const item=await lab.getAttribute('data-item-id');
    const answer=answers[mission][band][position];
    if(position===0){
     const hint=lab.getByRole('button',{name:/Give me a hint|Dame una pista/});
     await hint.click();const first=await lab.locator('.learning-hint').textContent();
     await hint.click();await expect(lab.locator('.learning-hint')).not.toHaveText(first!);
     await lab.getByRole('button',{name:es?'Explícalo de otra manera':'Explain another way',exact:true}).click();
     await expect(lab.locator('.learning-hint')).toHaveCount(2);
     await lab.locator(`[data-answer-id]:not([data-answer-id="${answer}"])`).first().click();
     await lab.getByRole('button',{name:es?'Intentar con esta pista':'Retry with this clue',exact:true}).click();
    }
    await lab.locator(`[data-answer-id="${answer}"]`).click();
    await expect(lab.locator('.learning-feedback')).toContainText(es?'¡Funciona!':'It works!');
    await lab.getByRole('button',{name:es?'Continuar':'Continue',exact:true}).click();
    const record=await page.evaluate(({key,item})=>JSON.parse(localStorage.getItem(key)!).profiles[0].learningLab.results[item!],{key,item});
    expect(record.correct).toBe(true);
    if(position>=2)expect(record.independent).toBe(true);
    if(position===0)expect(record.assisted).toBe(true);
   }
   await expect(lab.getByRole('heading',{name:es?'¡Misión completada!':'Mission complete!',exact:true})).toBeVisible();
   await page.reload();await page.getByRole('button',{name:/Robot Rescue · numbers|Rescate Robot · números/}).click();
   const rewards=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].learningLab.rewarded,key);
   expect(rewards).toHaveLength(band?6:mission+1);expect(new Set(rewards).size).toBe(rewards.length);
   const canonical=await page.evaluate(k=>{const p=JSON.parse(localStorage.getItem(k)!).profiles[0];return {stars:p.stars,completed:p.completedMissions.filter((id:string)=>id.startsWith('learning-lab:'))};},key);
   expect(canonical.stars-initialStars).toBe(2*(band?6:mission+1));
   expect(canonical.completed).toHaveLength(band?6:mission+1);
   expect(new Set(canonical.completed).size).toBe(canonical.completed.length);
  }
 }
});

test('keyboard lesson controls and enlarged narrow-screen text stay usable',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 const lab=page.getByTestId('learning-lab');
 const start=lab.getByRole('button',{name:es?'Me toca':'My turn',exact:true});
 await start.focus();await page.keyboard.press('Enter');
 await expect(lab.locator('.learning-answers')).toBeVisible();
 const hint=lab.getByRole('button',{name:/Give me a hint|Dame una pista/});
 await hint.focus();await page.keyboard.press('Space');await expect(lab.locator('.learning-hint')).toBeVisible();
 await lab.locator('[data-answer-id="3"]').focus();await page.keyboard.press('Enter');
 await expect(lab.locator('.learning-feedback')).toContainText(es?'¡Funciona!':'It works!');
 await page.setViewportSize({width:320,height:568});
 // CSS text enlargement is a reproducible layout check, not physical Safari zoom certification.
 await page.addStyleTag({content:'html { font-size: 200% !important; } .learning-lab { font-size: 1rem !important; }'});
 const continueButton=lab.getByRole('button',{name:es?'Continuar':'Continue',exact:true});
 await continueButton.scrollIntoViewIfNeeded();await continueButton.focus();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
 const previous=await lab.getAttribute('data-item-id');
 await page.keyboard.press('Enter');await expect(lab).not.toHaveAttribute('data-item-id',previous!);
 await expect(lab.locator('.learning-feedback')).toHaveCount(0);
 await page.setViewportSize({width:844,height:390});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
 await info.attach('enlarged-text-synthetic',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});

test('hands-on workspace records assistance and clears marks on next item',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 const lab=page.getByTestId('learning-lab');
 await lab.getByRole('button',{name:es?'Ver siguiente paso':'Show next step',exact:true}).click();
 await expect(lab.locator('.learning-demo')).toContainText('2 / 3');
 await lab.getByRole('button',{name:es?'Me toca':'My turn',exact:true}).click();
 await lab.getByRole('button',{name:es?'Explícalo de otra manera':'Explain another way',exact:true}).click();
 const workspace=lab.locator('.learning-workbench');
 await workspace.locator('.learning-manipulatives button').first().click();
 await expect(workspace).toContainText(es?'Marcados: 1':'Marked: 1');
 await lab.locator('[data-answer-id="3"]').click();
 await lab.getByRole('button',{name:es?'Continuar':'Continue',exact:true}).click();
 await expect(workspace).toHaveCount(0);
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].learningLab,key);
 expect(saved.results['supplies:gentle:0'].assisted).toBe(true);
});
test('English and Spanish word rescue stays separate and saves its phrase checks',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 await page.getByRole('button',{name:/Word rescue · English|Rescate de palabras · inglés/}).click();
 const game=page.locator('.language-rescue');
 for(const target of ['en','es-MX']){
  await game.getByRole('button',{name:target==='en'?(es?'Aprender inglés':'Learn English'):(es?'Aprender español':'Learn Spanish'),exact:true}).click();
  for(const [i,answer] of ['robot','key','door','battery','key','battery'].entries()){
   if(i<4)await game.getByRole('button',{name:es?'Buscar la imagen':'Find the picture',exact:true}).click();
   if(i===0){
    await game.locator('[data-word-answer="door"]').click();
    await game.getByRole('button',{name:es?'Volver a buscar':'Look again',exact:true}).click();
   }
   await game.locator(`[data-word-answer="${answer}"]`).click();
   await game.getByRole('button',{name:es?'Continuar':'Continue',exact:true}).click();
  }
  await expect(game).toContainText(es?'¡El robot está listo!':'The robot is ready!');
 }
 await page.reload();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].learningLab,key);
 for(const target of ['en','es-MX']){
  expect(saved.languageRescue[target].complete).toBe(true);
  expect(saved.languageRescue[target].results.robot.assisted).toBe(true);
  expect(saved.languageRescue[target].results['door-check'].independent).toBe(true);
  expect(saved.languageRescue[target].results['rescue-transfer'].independent).toBe(true);
 }
 expect(saved.rewarded).toEqual([]);
});

test('Arcade learning games complete by touch or keyboard and preserve best results',async({page},info)=>{
 const es=info.project.metadata.language==='es-MX';await boot(page,es?'es-MX':'en');
 await page.getByRole('button',{name:es?'Mapa del mundo':'World Map',exact:true}).click();
 await page.getByRole('button',{name:es?/Abrir destino: Sala de juegos/:/Open destination: Game Arcade/}).click();
 await page.getByTestId('open-word-match').click();
 const game=page.getByTestId('learning-arcade');
 await expect(game).toBeVisible();
 await game.locator('[data-memory-card="robot:word"]').click();
 await game.locator('[data-memory-card="key:picture"]').click();
 await game.getByRole('button',{name:es?'Volver a voltear':'Turn them back',exact:true}).click();
 for(const word of ['robot','key','door','battery']){
  await game.locator(`[data-memory-card="${word}:word"]`).click();
  await game.locator(`[data-memory-card="${word}:picture"]`).focus();await page.keyboard.press('Enter');
 }
 await expect(game).toContainText(es?'¡Rescate completado!':'Rescue complete!');
 await game.getByRole('button',{name:es?'← Todos los juegos':'← All games',exact:true}).click();
 await page.getByTestId('open-sentence-builder').click();
 for(const length of [3,3,5,4]){
  for(let i=0;i<length;i++)await game.locator(`[data-word-tile="${i}"]`).click();
  await game.getByRole('button',{name:es?'Probar mensaje':'Try message',exact:true}).click();
  await game.getByRole('button',{name:es?'Siguiente':'Next',exact:true}).click();
 }
 await expect(game).toContainText(es?'¡Rescate completado!':'Rescue complete!');
 await game.getByRole('combobox',{name:es?'Nivel de práctica de inglés':'English practice level'}).selectOption('a2');
 await expect(game.locator('[data-word-tile]')).toHaveCount(7);
 await game.getByRole('combobox',{name:es?'Ronda de frases':'Sentence round'}).selectOption('3');
 await expect(game.locator('[data-word-tile]')).toHaveCount(6);
 await game.getByRole('combobox',{name:es?'Nivel de práctica de inglés':'English practice level'}).selectOption('pre-a1');
 await expect(game.locator('[data-word-tile]')).toHaveCount(3);
 await page.reload();
 const target=es?'en':'es-MX';
 const scores=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).profiles[0].arcadeScores,key);
 expect(scores[`learning:word-match:${target}`]).toBe(4);
 expect(scores[`learning:sentence-builder:${target}`]).toBe(4);
 await page.getByTestId('open-word-match').click();
 await page.setViewportSize({width:320,height:568});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
});

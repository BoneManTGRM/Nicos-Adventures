import {expect,test,type Page,type TestInfo} from '@playwright/test';
import {readFileSync} from 'node:fs';
const language=(info:TestInfo)=>info.project.metadata.language==='es-MX';
async function boot(page:Page,info:TestInfo,hub?:'ask'|'dress'|'showtime'|'movies'){
 await page.goto('/');
 if(language(info))await page.getByRole('button',{name:'Cambiar a español de México'}).click();
 if(hub)await page.goto('/#nico/'+hub);
}
async function destination(page:Page,name:string){await page.locator('.fw-destination-grid > .fw-destination').filter({has:page.getByText(name,{exact:true})}).click();}
async function shot(page:Page,info:TestInfo,label:string){await info.attach(label,{body:await page.screenshot({fullPage:false}),contentType:'image/png'});}
async function bounds(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);}
async function speechStub(page:Page){
 await page.addInitScript(()=>{
  const root=window as unknown as {__speech:{calls:{text:string;voice:string}[];cancelled:number;paused:boolean}};
  root.__speech={calls:[],cancelled:0,paused:false};
  let current:{onstart?:()=>void;onend?:()=>void}|null=null,timer=0;
  class Utterance{text:string;voice?:{voiceURI:string};lang='';rate=1;pitch=1;volume=1;onstart?:()=>void;onend?:()=>void;onerror?:()=>void;constructor(text:string){this.text=text;}}
  const synth=new EventTarget() as EventTarget&Record<string,unknown>;
  synth.getVoices=()=>[{name:'Local Enhanced English',lang:'en-US',voiceURI:'local-en',localService:true,default:true},{name:'Local Enhanced Spanish',lang:'es-MX',voiceURI:'local-es',localService:true,default:false},{name:'Remote Premium',lang:'en-US',voiceURI:'remote',localService:false,default:false}];
  synth.speak=(u:Utterance)=>{current=u;root.__speech.calls.push({text:u.text,voice:u.voice?.voiceURI??''});timer=window.setTimeout(()=>u.onstart?.(),20);};
  synth.cancel=()=>{clearTimeout(timer);current=null;root.__speech.cancelled++;};
  synth.pause=()=>{root.__speech.paused=true;};synth.resume=()=>{root.__speech.paused=false;};
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:Utterance});Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});
 });
}
test('discovery facts, source cards, quizzes and local-only voice controls',async({page},info)=>{
 await speechStub(page);await boot(page,info,'ask');const es=language(info);
 await expect(page.getByTestId('nico-surprise-fact')).toBeVisible();await page.getByTestId('nico-surprise-fact').click();const first=await page.locator('.nico-chat-exchange').last().getAttribute('data-fact-id');await page.getByTestId('nico-surprise-fact').click();expect(await page.locator('.nico-chat-exchange').last().getAttribute('data-fact-id')).not.toBe(first);
 await page.locator('#nico-question').fill(es?'¿Cuántos corazones tiene un pulpo?':'How many hearts does an octopus have?');await page.locator('.nico-question-form button').click();await expect(page.locator('.nico-chat-answer').last()).toContainText(es?'tres corazones':'three hearts');
 await page.locator('.discovery-source').last().locator('summary').click();await expect(page.locator('.discovery-source').last().locator('a')).toHaveAttribute('href',/ocean.si.edu/);
 await page.getByTestId('nico-quiz').click();await page.locator('.discovery-quiz>div button').first().click();await expect(page.locator('.discovery-quiz')).toContainText(es?'¡Exacto!':'You got it!');
 await page.getByRole('button',{name:es?'Leer respuesta':'Read answer',exact:true}).click();await expect(page.locator('.nico-narration')).toHaveAttribute('data-narration-status','speaking');
 expect(await page.evaluate(()=> (window as unknown as {__speech:{calls:{voice:string}[]}}).__speech.calls.at(-1)?.voice)).toBe(es?'local-es':'local-en');
 await page.getByRole('button',{name:es?'Pausar voz':'Pause voice',exact:true}).click();await expect(page.locator('.nico-narration')).toHaveAttribute('data-narration-status','paused');await page.getByRole('button',{name:es?'Detener voz':'Stop voice',exact:true}).click();
 await page.locator('.nico-narration summary').click();expect(await page.locator('.nico-narration select').first().locator('option').allTextContents()).not.toContain('Remote Premium');
 await page.locator('.discovery-actions').scrollIntoViewIfNeeded();await shot(page,info,'ask-nico-discovery-club');await bounds(page);
});
test('wardrobe keeps approved art and supports favorite, undo, search and real PNG portrait',async({page},info)=>{
 await boot(page,info,'dress');const es=language(info),cards=page.locator('.nico-profession-grid>button');await expect(cards).toHaveCount(26);
 const first=await cards.first().locator('strong').innerText();await cards.nth(1).click();await page.getByTestId('favorite-outfit').click();await page.locator('[data-closet-category="favorites"]').click();await expect(cards).toHaveCount(1);await expect(cards.first()).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:es?'Deshacer cambio':'Undo outfit',exact:true}).click();await page.locator('[data-closet-category="all"]').click();await expect(cards.first()).toHaveAttribute('aria-pressed','true');
 await page.locator('.nico-premium-wardrobe__search input').fill(es?'cientifico':'scientist');await expect(cards).toHaveCount(1);await cards.first().click();await page.locator('[data-closet-background="garden"]').click();
 const download=page.waitForEvent('download');await page.getByTestId('outfit-portrait').click();const png=await download;expect(png.suggestedFilename()).toMatch(/\.png$/);const path=await png.path();expect(readFileSync(path!).subarray(1,4).toString()).toBe('PNG');expect(readFileSync(path!).byteLength).toBeGreaterThan(15000);
 await page.locator('.nico-dress-preview').scrollIntoViewIfNeeded();await info.attach('wardrobe-portrait-studio',{body:await page.locator('.nico-dress-preview').screenshot(),contentType:'image/png'});await bounds(page);await page.reload();await page.locator('[data-closet-category="favorites"]').click();await expect(cards).toHaveCount(1);expect(first).toBeTruthy();
});
test('movie director edits scenes and captions, saves exact timeline, and reopens without duplicate rewards',async({page},info)=>{
 await boot(page,info,'showtime');const es=language(info);await expect(page.getByTestId('movie-preview')).toBeEnabled({timeout:30000});
 await page.locator('[data-movie-template="space-rescue"]').click();await expect(page.locator('[data-movie-shot]')).toHaveCount(4);await page.locator('[data-movie-character="friend:lua"]').click();await expect(page.locator('.director-cast summary')).toContainText('3/3');
 await page.getByRole('combobox',{name:es?'Formato':'Format',exact:true}).selectOption('portrait');await page.getByLabel(es?'Título':'Movie title',{exact:true}).fill('Three Friends');await page.locator('[data-movie-shot="1"]').click();await page.getByLabel(es?'Texto de esta toma':'This shot’s caption',{exact:true}).fill('A secret star for our team');
 await expect(page.getByTestId('movie-preview')).toBeEnabled({timeout:30000});const canvas=page.getByTestId('movie-canvas');await expect(canvas).toHaveAttribute('width','432');await expect(canvas).toHaveAttribute('height','768');
 await page.getByTestId('movie-save').click();const old=await page.evaluate(()=>JSON.parse(localStorage.getItem('nicos-world-local-save-v4')!).profiles[0]);await page.getByTestId('movie-save').click();const twice=await page.evaluate(()=>JSON.parse(localStorage.getItem('nicos-world-local-save-v4')!).profiles[0]);expect(twice.stars).toBe(old.stars);expect(twice.movieProjects).toHaveLength(1);expect(twice.movieProjects[0].poseSequence[1].caption).toBe('A secret star for our team');
 await canvas.scrollIntoViewIfNeeded();await shot(page,info,'movie-director-three-friends');await bounds(page);
 await page.reload();await page.locator('.nico-hub__tabs button').last().click();await page.locator('.nico-movie-card').filter({hasText:'Three Friends'}).locator('.nico-primary-action').click();
 await expect(page.getByRole('combobox',{name:es?'Formato':'Format',exact:true})).toHaveValue('portrait');await page.locator('[data-movie-shot="1"]').click();await expect(page.getByLabel(es?'Texto de esta toma':'This shot’s caption',{exact:true})).toHaveValue('A secret star for our team');
});
test('movie recording creates real playable video and cancellation releases the capture stream',async({page},info)=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.captureStream;const root=window as unknown as {__captures:MediaStream[]};root.__captures=[];if(original)HTMLCanvasElement.prototype.captureStream=function(rate?:number){const s=original.call(this,rate);root.__captures.push(s);return s;};});
 await boot(page,info,'showtime');const es=language(info);await expect(page.getByTestId('movie-preview')).toBeEnabled({timeout:30000});
 await page.getByRole('button',{name:es?'Quitar toma':'Remove shot',exact:true}).click();await page.getByRole('button',{name:es?'Quitar toma':'Remove shot',exact:true}).click();await page.getByRole('combobox',{name:es?'Duración de toma':'Shot length',exact:true}).selectOption('1000');
 await page.locator('.director-export input[type="checkbox"]').check();
 const supported=await page.evaluate(()=>typeof MediaRecorder!=='undefined'&&typeof HTMLCanvasElement.prototype.captureStream==='function'&&['video/webm;codecs=vp8','video/webm','video/mp4;codecs=avc1.42E01E','video/mp4'].some(t=>MediaRecorder.isTypeSupported(t)));
 if(!supported){await expect(page.getByTestId('movie-record')).toBeDisabled();await expect(page.locator('.director-export')).toContainText(es?'no la grabación':'not recording');return;}
 await page.getByTestId('movie-record').click();await expect(page.getByTestId('movie-download')).toBeVisible({timeout:20000});const video=page.locator('.director-result video');await video.evaluate((el:HTMLVideoElement)=>{el.muted=true;return el.play();});await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(0);
 const file=page.waitForEvent('download');await page.getByTestId('movie-download').click();const output=await file;const path=await output.path();expect(readFileSync(path!).byteLength).toBeGreaterThan(2000);expect(output.suggestedFilename()).toMatch(/\.(webm|mp4)$/);
 expect(await page.evaluate(()=> (window as unknown as {__captures:MediaStream[]}).__captures.every(s=>s.getTracks().every(t=>t.readyState==='ended')))).toBe(true);
 await page.getByRole('combobox',{name:es?'Duración de toma':'Shot length',exact:true}).selectOption('6000');await page.getByTestId('movie-record').click();await page.getByRole('button',{name:es?'Cancelar grabación':'Cancel recording',exact:true}).click();await expect(page.locator('.director-studio')).toHaveAttribute('data-recording','false',{timeout:12000});expect(await page.evaluate(()=> (window as unknown as {__captures:MediaStream[]}).__captures.every(s=>s.getTracks().every(t=>t.readyState==='ended')))).toBe(true);
 await info.attach('actual-recording-proof',{body:Buffer.from(JSON.stringify({file:output.suggestedFilename(),bytes:readFileSync(path!).byteLength,tracksEnded:true,realEncoder:true})),contentType:'application/json'});
});
test('Story Castle displays real illustrations, saves choices and highlights narration without losing original books',async({page},info)=>{
 await speechStub(page);await boot(page,info);const es=language(info);await destination(page,es?'Castillo de cuentos':'Story Castle');await expect(page.locator('.story-reader')).toBeVisible();await expect(page.locator('.story-scene img')).toBeVisible();expect(await page.locator('.story-scene img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 const next=page.locator('.story-page-turner button').last();await next.click();await page.locator('[data-story-choice="0-1"]').click();await next.click();await expect(page.locator('.story-reader__text')).toContainText(es?'melodía':'melody');await next.click();await page.locator('[data-story-choice="1-1"]').click();await next.click();await expect(page.locator('.story-reader__text')).toContainText(es?'criatura':'creature');
 await page.getByRole('button',{name:es?'Guardar cuento':'Save story',exact:true}).click();await page.getByRole('button',{name:es?'Leer página':'Read page',exact:true}).click();await expect(page.locator('.story-sentence.is-reading')).toHaveCount(1);await page.getByRole('button',{name:es?'Detener voz':'Stop voice',exact:true}).click();
 await page.getByRole('button',{name:es?'Letra grande':'Bigger text',exact:true}).click();await page.locator('.story-scene').scrollIntoViewIfNeeded();await shot(page,info,'illustrated-story-reader');await bounds(page);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('nicos-world-local-save-v4')!).profiles[0].stories[0]);expect(stored.adventureChoices).toEqual([1,1]);await page.reload();await page.locator('.creative-library-grid article').first().getByRole('button',{name:es?'Abrir':'Open',exact:true}).click();await next.click();await expect(page.locator('[data-story-choice="0-1"]')).toHaveAttribute('aria-pressed','true');
});
test('Monster Lab removes the ghost pod and the same monster plays a low-power action game',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,info);const es=language(info);await destination(page,es?'Laboratorio de monstruos':'Monster Lab');const lab=page.locator('.monster-studio__preview .monster-stage').first();
 const actualStage=page.locator('.monster-stage').first();await expect(actualStage).toBeVisible();await expect(actualStage.locator('.monster-stage__environment')).toBeHidden();await expect(actualStage.locator('.monster-atmosphere')).toBeHidden();expect(await actualStage.evaluate(node=>getComputedStyle(node,'::before').content)).toBe('none');
 const art=actualStage.locator('.monster-premium-body__art');await expect(art).toBeVisible();expect(await art.evaluate(node=>getComputedStyle(node).backgroundImage)).not.toBe('none');await actualStage.scrollIntoViewIfNeeded();await info.attach('monster-lab-no-glass-pod',{body:await actualStage.screenshot(),contentType:'image/png'});
 await page.getByTestId('lab-play-monsters').click();await page.getByTestId('rift-start').click();const canvas=page.getByTestId('rift-canvas');await canvas.focus();await page.keyboard.down('ArrowLeft');await page.keyboard.down('Space');await page.waitForTimeout(850);await page.keyboard.up('ArrowLeft');await page.keyboard.up('Space');await expect.poll(async()=>Number(await canvas.getAttribute('data-shots'))).toBeGreaterThan(1);await expect.poll(async()=>Number(await canvas.getAttribute('data-traveled'))).toBeGreaterThan(15);
 await page.getByTestId('rift-power').click();await expect.poll(async()=>Number(await canvas.getAttribute('data-power-uses'))).toBeGreaterThan(0);await expect(page.locator('.monster-rift__avatar .monster-premium-body__art')).toBeVisible();await shot(page,info,'monster-rift-real-gameplay');await bounds(page);
 await page.locator('.monster-rift__header button').last().click();await expect(page.locator('.monster-rift')).toHaveAttribute('data-rift-status','paused');const frames=await canvas.getAttribute('data-frames');await page.waitForTimeout(400);expect(await canvas.getAttribute('data-frames')).toBe(frames);await expect(canvas).toHaveAttribute('data-renderer','canvas2d');expect(errors).toEqual([]);
});

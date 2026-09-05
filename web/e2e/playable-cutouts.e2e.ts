import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { WORLD_SECTIONS } from '../src/world/catalogs';
import type { SectionId } from '../src/types';
const WILDLIFE_IDS=['jaguar','toucan','sloth','poison-dart-frog','blue-whale','giant-pacific-octopus','sea-turtle','manta-ray','lion','african-elephant','giraffe','meerkat','polar-bear','arctic-fox','emperor-penguin','walrus','fennec-fox','camel','roadrunner','gila-monster','red-panda','flying-squirrel','great-horned-owl','beaver','axolotl','capybara','flamingo','platypus','snow-leopard','mountain-goat','andean-condor','yak'];
type Checkpoint={cell:number;clear:number[]|null;solid:number[];rgba:number[]};
const checkpoints=JSON.parse(readFileSync(resolve('e2e/cutout-pixel-checkpoints.json'),'utf8')) as Record<string,Checkpoint[]>;
const report=JSON.parse(readFileSync(resolve('src/assets/cutout-repair.provenance.json'),'utf8')) as {records:{path:string;sha256:string;width:number;height:number}[]};
async function open(page:Page,info:TestInfo,id:SectionId){
  await page.goto('/');await page.locator('.fw-brand').click();
  const es=info.project.metadata.language==='es-MX';
  const language=await page.locator('html').getAttribute('lang');
  if(es&&language!=='es-MX')await page.getByRole('button',{name:'Cambiar a español de México'}).click();
  if(!es&&language==='es-MX')await page.getByRole('button',{name:'Switch to English'}).click();
  const title=WORLD_SECTIONS.find(section=>section.id===id)!.name[es?'es-MX':'en'];
  await page.locator('.fw-destination-grid > .fw-destination').filter({has:page.getByText(title,{exact:true})}).click();
  return es;
}
async function shot(page:Page,info:TestInfo,label:string,selector:string){
  const target=page.locator(selector);await target.scrollIntoViewIfNeeded();
  await info.attach(label,{body:await target.screenshot({animations:'disabled'}),contentType:'image/png'});
}
async function loadedImages(page:Page,selector:string){
  await expect.poll(()=>page.locator(selector).evaluateAll(nodes=>nodes.length>0&&nodes.every(node=>{
    const image=node as HTMLImageElement;return image.complete&&image.naturalWidth>0;
  }))).toBe(true);
}
test('shipped cutout bytes retain white details and clear reviewed negative spaces',async({page},info)=>{
  await page.goto('/');const files=readdirSync(resolve('dist/assets'));const receipts=[];
  expect(report.records).toHaveLength(13);
  for(const record of report.records){
    const stem=basename(record.path,'.webp');
    const file=files.find(name=>name.startsWith(stem+'-')&&name.endsWith('.webp'));
    expect(file,stem).toBeTruthy();const url='/assets/'+file;
    const response=await page.request.get(url);expect(response.ok(),stem).toBe(true);
    expect(createHash('sha256').update(await response.body()).digest('hex'),stem).toBe(record.sha256);
    const result=await page.evaluate(async({url,samples,atlas})=>{
      const image=new Image();image.src=url;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);
      const read=(x:number,y:number)=>Array.from(ctx.getImageData(x,y,1,1).data);
      return {width:canvas.width,height:canvas.height,corner:read(0,0)[3],samples:samples.map(point=>{
        const x=atlas?(point.cell%8)*320:0,y=atlas?Math.floor(point.cell/8)*320:0;
        return {cell:point.cell,solid:read(x+point.solid[0],y+point.solid[1]),clear:point.clear?read(x+point.clear[0],y+point.clear[1])[3]:null};
      })};
    },{url,samples:checkpoints[stem],atlas:stem.includes('atlas')});
    expect(result.width).toBe(record.width);expect(result.height).toBe(record.height);expect(result.corner).toBe(0);
    for(let i=0;i<result.samples.length;i++){
      const actual=result.samples[i],expected=checkpoints[stem][i];
      if(expected.clear)expect(actual.clear,stem+' gap '+i).toBe(0);
      for(let channel=0;channel<4;channel++)expect(Math.abs(actual.solid[channel]-expected.rgba[channel]),stem+' material '+i).toBeLessThanOrEqual(2);
    }
    receipts.push({asset:stem,sha256:record.sha256,...result});
  }
  await info.attach('cutout-pixel-receipts',{body:Buffer.from(JSON.stringify(receipts,null,2)),contentType:'application/json'});
});
test('Becca, Lua and every unicorn pose use the corrected native assets',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const es=await open(page,info,'becca-corner');
  await loadedImages(page,'.becca-team-showcase__character');
  await expect(page.locator('.magic-host-picker canvas[data-art-state="ready"]')).toHaveCount(2);
  await shot(page,info,'becca-lua-transparent-portraits','.becca-team-showcase__portraits');
  for(const [pose,en,spanish] of [['prance','Prance','Trotar'],['turn','Turn','Voltear'],['float','Float','Flotar'],['rest','Rest','Descansar']]){
    await page.locator('.becca-motion-grid button').filter({hasText:es?spanish:en}).click();
    await expect(page.locator('.unicorn-lab__stage')).toHaveAttribute('data-unicorn-pose',pose);
    await loadedImages(page,'.becca-unicorn');
    await expect(page.locator('.becca-unicorn')).toHaveAttribute('src',new RegExp('unicorn-'+pose+'-v2'));
    await shot(page,info,'unicorn-'+pose,'.unicorn-lab__stage');
  }
  await page.locator('.magic-host-picker button').filter({hasText:'Lua'}).click();
  await expect(page.locator('.unicorn-lab__stage')).toHaveAttribute('data-host','lua');
  await loadedImages(page,'.unicorn-lab__guide');expect(errors).toEqual([]);
});
test('all 32 real wildlife canvases preserve pale material without paper floors',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,info,'animal-forest');const selector='.animal-field-guide-grid .wildlife-sprite';
  await expect(page.locator(selector)).toHaveCount(32);
  await expect(page.locator(selector+'[data-art-state="ready"]')).toHaveCount(32);
  const measurements=await page.locator(selector).evaluateAll((nodes,{ids,samples})=>nodes.map(node=>{
    const canvas=node as HTMLCanvasElement,ctx=canvas.getContext('2d')!;
    const id=canvas.dataset.animalId!,index=ids.indexOf(id),point=samples[index],map=(n:number)=>Math.round(11.2+n*.93);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let visible=0;for(let i=3;i<data.length;i+=4)if(data[i]>128)visible++;
    return {id,visible,solid:Array.from(ctx.getImageData(map(point.solid[0]),map(point.solid[1]),1,1).data),clear:point.clear?ctx.getImageData(map(point.clear[0]),map(point.clear[1]),1,1).data[3]:null};
  }),{ids:WILDLIFE_IDS,samples:checkpoints['wildlife-premium-clean-atlas']});
  await info.attach('wildlife-canvas-receipts',{body:Buffer.from(JSON.stringify(measurements,null,2)),contentType:'application/json'});
  expect(new Set(measurements.map(item=>item.id)).size).toBe(32);
  for(const item of measurements){
    expect(item.visible,item.id).toBeGreaterThan(1000);
    expect(item.solid[3],item.id+' solid material').toBeGreaterThan(240);
    const index=WILDLIFE_IDS.indexOf(item.id);
    if(checkpoints['wildlife-premium-clean-atlas'][index].rgba.slice(0,3).every(value=>value>226))expect(Math.min(...item.solid.slice(0,3)),item.id+' pale material').toBeGreaterThan(200);
    if(item.clear!==null)expect(item.clear,item.id+' paper gap').toBeLessThan(8);
  }
  await page.evaluate(selector=>{
    const panel=document.createElement('div');panel.id='cutout-proof';panel.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;background:#102139;position:relative;z-index:99999';
    document.querySelectorAll<HTMLCanvasElement>(selector).forEach(canvas=>{
      const card=document.createElement('div'),label=document.createElement('div');label.textContent=canvas.dataset.animalId!;label.style.cssText='color:white;font:12px sans-serif';
      const img=new Image();img.src=canvas.toDataURL();img.style.cssText='display:block;width:100%;height:auto';card.append(img,label);panel.append(card);
    });document.body.append(panel);
  },selector);
  await shot(page,info,'all-32-rendered-wildlife','#cutout-proof');
  expect(errors).toEqual([]);
});
test('cousins portraits and all four Sparky poses keep working with native transparency',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,info,'cousins-adventure');await loadedImages(page,'.cousins-hero__becca,.cousins-hero__lua');
  await shot(page,info,'cousins-corrected-cutouts','.cousins-hero__team');
  const es=await open(page,info,'pet-workshop');
  await page.locator('.fw-action-row button').filter({hasText:es?'Nueva mascota':'New pet'}).click();
  await page.locator('.fw-action-row button.fw-primary').click();
  await loadedImages(page,'.pet-training-stage .pet-art img');
  await shot(page,info,'sparky-idle','.pet-training-stage');
  for(const [pose,en,spanish] of [['sit','Sit','Sentarse'],['fetch-tool','Fetch a tool','Traer una herramienta'],['high-five','High five','Chocar los cinco']]){
    await page.locator('.pet-trick-grid button').filter({has:page.getByText(es?spanish:en,{exact:true})}).click();
    await expect(page.locator('.pet-training-stage [data-pet-pose]')).toHaveAttribute('data-pet-pose',pose);
    await loadedImages(page,'.pet-training-stage .pet-art img');
    await shot(page,info,'sparky-'+pose,'.pet-training-stage');
  }
  expect(errors).toEqual([]);
});
